import os
from collections import namedtuple, OrderedDict
from graphql import (
    GraphQLField, GraphQLNonNull, GraphQLArgument,
    GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLString,
    GraphQLSchema, GraphQLInt
)

import config as cfg


Todo = namedtuple('Todo', 'id text completed')
TodoList = namedtuple('TodoList', 'todos')
Image = namedtuple('Image', 'id src thumbnail thumbnailWidth thumbnailHeight tags caption modelTags')
ImageList = namedtuple('ImageList', 'images') 

TodoType = GraphQLObjectType(
    name='Todo',
    fields=lambda: {
        'id': GraphQLField(
            GraphQLNonNull(GraphQLString),
        ),
        'text': GraphQLField(
            GraphQLString
        ),
        'completed': GraphQLField(
            GraphQLBoolean
        )
    }
)

TodoListType = GraphQLObjectType(
    name='TodoList',
    fields=lambda: {
        'todos': GraphQLField(
            GraphQLList(TodoType),
            resolver=lambda todo_list, *_: get_todos(todo_list),
        )
    }
)
            # src: "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg",
            # thumbnail: "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg",
            # thumbnailWidth: 320,
            # thumbnailHeight: 174,
            # tags: [{value: "Nature", title: "Nature"}, {value: "Flora", title: "Flora"}],
            # caption: "After Rain (Jeshu John - designerspics.com)",
            # isSelected: true


ImageType = GraphQLObjectType(
    name='Image',
    fields= {
        'id': GraphQLField(
            GraphQLNonNull(GraphQLString),
        ),
        'src': GraphQLField(
            GraphQLString
        ),
        'thumbnail': GraphQLField(
            GraphQLString
        ),
        'thumbnailWidth': GraphQLField(
            GraphQLInt
        ),
        'thumbnailHeight': GraphQLField(
            GraphQLInt
        ),
        'caption': GraphQLField(
            GraphQLString
        ),
        'tags': GraphQLField(
            GraphQLList(GraphQLString)
        ),
        'modelTags': GraphQLField(
            GraphQLList(GraphQLString)
        )
    }
)

ImageListType = GraphQLObjectType(
    name='ImageList',
    fields=lambda: {
        'images': GraphQLField(
            GraphQLList(ImageType),
            resolver=lambda image_list, *_: get_images(image_list),
        )
    }
)

todo_data = OrderedDict({
    '1': Todo(id='1', text='Make America Great Again', completed=False),
    '2': Todo(id='2', text='Quit TPP', completed=False)
})

def img_url(fname):
    return cfg.IMG_ENDPOINT + '/{:s}'.format(fname)

image_data = OrderedDict({
    '1': Image(
        id='1',
        src=img_url("cat.7407.jpg"),
        thumbnail=img_url("cat.7407.jpg"),
        thumbnailWidth=300,
        thumbnailHeight=300,
        tags=["Nature"],
        caption="After Rain (Jeshu John - designerspics.com)",
        modelTags=[]
    ),
    '2': Image(
        id='2',
        src=img_url("cat.7407.jpg"),
        thumbnail=img_url("cat.7407.jpg"),
        thumbnailWidth=300,
        thumbnailHeight=300,
        tags=["Nature"],
        caption="After Rain (Jeshu John - designerspics.com)",
        modelTags=[]
    ),
})

def get_todo_list():
    print("getting todo list")
    return TodoList(todos=todo_data.keys())


def get_todo(id):
    return todo_data.get(id)


def get_todos(todo_list):
    return map(get_todo, todo_list.todos)


def get_todo_single():
    return Todo(id=1, text='Make America Great Again', completed=False)


def add_todo(text):
    todo = Todo(id=str(len(todo_data) + 1), text=text, completed=False)
    todo_data[todo.id] = todo
    return todo


def toggle_todo(id):
    cur_todo = todo_data[id]
    todo = Todo(id=id, text=cur_todo.text, completed=not cur_todo.completed)
    todo_data[id] = todo
    return todo


# Images

def get_image_list():
    return ImageList(images=image_data.keys())


def get_image(id_):
    return image_data.get(id_)


def get_images(image_list):
    return map(get_image, image_list.images)


def get_image_single():
    return image_data['1']


def add_image(src, tags, modelTags):
    image = Image(id=str(len(image_data) + 1), src=src, 
                  tags=tags, modelTags=modelTags)
    image_data[image.id] = image
    return image


def update_tags(id_, tags):
    print(id_, tags)
    img = image_data[id_]
    image_data[id_] = img._replace(tags=tags)
    print("ID",image_data)
    img = image_data.get(id_)
    print("I",  img, type(img))
    return img


QueryRootType = GraphQLObjectType(
    name='Query',
    fields=lambda: {
        'test': GraphQLField(
            GraphQLString,
            args={
                'who': GraphQLArgument(GraphQLString)
            },
            resolver=lambda root, args, *_:
                'Hello %s' % (args.get('who') or 'World')
        ),
        'todo': GraphQLField(
            TodoType,
            resolver=lambda root, args, *_: get_todo_single(),
        ),
        'todoList': GraphQLField(
            TodoListType,
            resolver=lambda root, args, *_: get_todo_list(),
        ),
        'image': GraphQLField(
            ImageType,
            resolver=lambda root, args, *_: get_image_single(),
        ),
        'imageList': GraphQLField(
            ImageListType,
            resolver=lambda root, args, *_: get_image_list(),
        )
    }
)


MutationRootType = GraphQLObjectType(
    name='Mutation',
    fields=lambda: {
        'addTodo': GraphQLField(
            TodoType,
            args={
                'text': GraphQLArgument(GraphQLString)
            },
            resolver=lambda root, args, *_: add_todo(args.get('text'))
        ),
        'toggleTodo': GraphQLField(
            TodoType,
            args={
                'id': GraphQLArgument(GraphQLString)
            },
            resolver=lambda root, args, *_: toggle_todo(args.get('id'))
        ),
        'addImage': GraphQLField(
            ImageType,
            args={
                'src': GraphQLArgument(GraphQLString),
                'userLabels': GraphQLArgument(GraphQLList(GraphQLString)),
                'modelLabels': GraphQLArgument(GraphQLList(GraphQLString))
            },
            resolver=lambda root, args, *_: add_image(
                args.get('src'), args.get('tags'), 
                args.get('modelTags'))
        ),
        'updateImageTags': GraphQLField(
            ImageType,
            args={
                'id': GraphQLArgument(GraphQLString),
                'tags': GraphQLArgument(GraphQLList(GraphQLString))
            },
            resolver=lambda root, args, *_: update_tags(
                args.get('id'), args.get('tags'))
        ),
    }
)

Schema = GraphQLSchema(QueryRootType, MutationRootType)

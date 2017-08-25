import os
import random
from collections import namedtuple, OrderedDict
from graphql import (
    GraphQLField, GraphQLNonNull, GraphQLArgument,
    GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLString,
    GraphQLSchema, GraphQLInt
)

import config as cfg
import data


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





IMAGE_DATA = OrderedDict({
    "cat.7407": Image(
        id="cat.7407",
        src=data.img_url("cat.7407"),
        thumbnail=data.img_url("cat.7407"),
        thumbnailWidth=cfg.DEFAULT_WIDTH,
        thumbnailHeight=cfg.DEFAULT_HEIGHT,
        tags=["Nature"],
        caption="After Rain (Jeshu John - designerspics.com)",
        modelTags=[]
    ),
    "cat.7408": Image(
        id="cat.7408",
        src=data.img_url("cat.7408"),
        thumbnail=data.img_url("cat.7408"),
        thumbnailWidth=cfg.DEFAULT_WIDTH,
        thumbnailHeight=cfg.DEFAULT_HEIGHT,
        tags=["Nature"],
        caption="After Rain (Jeshu John - designerspics.com)",
        modelTags=[]
    ),
})


def make_image(id_, meta):
    img_meta = data.get_row_by_id(meta, id_)
    print("IMG_META", img_meta)
    tags = [] if img_meta is None else img_meta['labels'].split()
    mdl_tags = [] if img_meta is None else img_meta['model_labels'].split()
    img = Image(
        id=id_,
        src=data.img_url(id_),
        thumbnail=data.img_url(id_),
        thumbnailWidth=cfg.DEFAULT_WIDTH,
        thumbnailHeight=cfg.DEFAULT_HEIGHT,
        tags=tags,
        caption="TODO..",
        modelTags=mdl_tags
    )
    return img


def get_image_data(dset, shuffle=False, limit=20):
    meta = data.load_metadata_df(cfg.METADATA_FPATH)
    fold = data.load_fold(cfg.FOLD_FPATH)
    
    ids = fold[dset]
    if shuffle:
        random.shuffle(ids)
    
    image_data = {}
    for id_ in ids[:limit]:
        image_data[id_] = make_image(id_, meta)
    return image_data



# Images

def get_image_list():
    image_data = get_image_data(cfg.UNLABELED, shuffle=True, 
                                limit=cfg.BATCH_SIZE)
    return ImageList(images=image_data.keys())


def get_image(id_):
    meta = data.load_metadata_df(cfg.METADATA_FPATH)
    return make_image(id_, meta)


def get_images(image_list):
    return map(get_image, image_list.images)


def get_image_single():
    image_data = get_image_data(cfg.UNLABELED)
    return image_data['1']


def add_image(src, tags, modelTags):
    image_data = get_image_data(cfg.UNLABELED)
    image = Image(id=str(len(image_data) + 1), src=src, 
                  tags=tags, modelTags=modelTags)
    image_data[image.id] = image
    return image


def update_tags(id_, tags):
    meta = data.load_metadata_df(cfg.METADATA_FPATH)
    tags = ' '.join(tags)
    model_tags = ''
    data.insert_or_append_df(meta, id_, [tags, model_tags])
    data.save_metadata_df(meta, cfg.METADATA_FPATH)


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

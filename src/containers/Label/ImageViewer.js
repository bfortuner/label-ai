import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gallery from './Gallery.js';
import 'react-select/dist/react-select.css';
import LabelSelector from './LabelSelector.js'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import './normalize.css';
import './App.css';
import './github-light.css';
import { Divider } from 'semantic-ui-react';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import IPropTypes from 'react-immutable-proptypes';
import { List } from 'semantic-ui-react';
import TodoList from '../../components/TodoList';
import Todo from '../../components/Todo';


class ImageViewer extends Component {
    constructor(props){
        super(props);

        this.state = {
            selectAllChecked: false,
            labelOptions: this.props.labelOptions,
            selectedLabels: this.props.selectedLabels,
        };

        this.onSelectImage = this.onSelectImage.bind(this);
        this.getSelectedImages = this.getSelectedImages.bind(this);
        this.onClickSelectAll = this.onClickSelectAll.bind(this);
        this.overwriteLabel = this.overwriteLabel.bind(this);
        this.appendLabel = this.appendLabel.bind(this);
        this.onClick = this.onClick.bind(this);
        this.buildImage = this.buildImage.bind(this);
        this.buildImages = this.buildImages.bind(this);

    }

    allImagesSelected (images){
        var f = images.filter(
            function (img) {
                return img.isSelected === true;
            }
        );
        return f.length === images.length;
    }

    onSelectImage (index, image) {
        console.log("STATE", this.state.images);
        console.log("SelectingOne", image, index);
        var images = this.state.images; //this.buildImages(this.state.images);//.slice();
        console.log("IMAGES",images);
        var img = images[index];
        if(img.hasOwnProperty("isSelected"))
            img.isSelected = !img.isSelected;
        else
            img.isSelected = true;

        this.setState({
            images: images
        });
    }

    getSelectedImages () {
        var selected = [];
        for(var i = 0; i < this.state.images.length; i++)
            if(this.state.images[i].isSelected === true)
                selected.push(i);
        return selected;
    }

    getSelectedLabels() {
        var labels = []
        for(var i = 0; i < this.state.selectedLabels.length; i++) {
            let lb = this.state.selectedLabels[i].value;
            if (labels.indexOf(lb) === -1)
                labels.push(lb);
        }
        return labels
    }

    makeLabels(labelNames) {
        labelNames = Array.from(new Set(labelNames));
        var labels = [];
        for(var i = 0; i < labelNames.length; i++) {
            if (labels.indexOf(labelNames[i]) === -1)
                labels.push({
                    value: labelNames[i],
                    title: labelNames[i]
                })
        }
        return labels
    }

    getNamesFromLabels (labels) {
        var names = []
        for (var i = 0; i < labels.length; i++)
            names.push(labels[i].value);
        return names;
    }

    onClick () {
        console.log("CLICK");
    }

    overwriteLabel () {
       var images = this.state.images.slice();
       var labels = this.makeLabels(this.getSelectedLabels());
        for(var i = 0; i < images.length; i++) {
            if(images[i].isSelected === true)
                images[i].tags = labels;
        }
        this.setState({
            images: images
        });
    }

    appendLabel () {
        var images = this.state.images.slice();
        var labelNames = this.getSelectedLabels();
         for(var i = 0; i < images.length; i++) {
             if(images[i].isSelected === true) {
                if (images[i].tags == null) { 
                    images[i].tags = this.makeLabels(labelNames);                    
                } else {
                    var current = this.getNamesFromLabels(images[i].tags);
                    var joined = current.concat(labelNames);
                    images[i].tags = this.makeLabels(joined);
                }
             }
         }
         this.setState({
             images: images
         });
     }

    onClickSelectAll () {
        console.log("Selectingall");
        var selectAllChecked = !this.state.selectAllChecked;
        this.setState({
            selectAllChecked: selectAllChecked
        });

        var images = this.state.images.slice();
        if(selectAllChecked){
            for(var i = 0; i < this.state.images.length; i++)
                images[i].isSelected = true;
        }
        else {
            for(var j = 0; j < this.state.images.length; j++)
                images[j].isSelected = false;

        }
        this.setState({
            images: images
        });
    }

    updateLabels (selected) {
        this.setState({
            selectedLabels: selected
        });
    }

    buildTags (tags) {
        var displayTags = []
        for (var i = 0; i<tags.length; i++)
            displayTags.push({value: tags[i], title: tags[i]})
        return displayTags;
    }

    buildImage (image) {
        // var items = images.toArray().slice();
        var item = image;
        item.id = item.get('id');
        item.key = item.get('id');
        item.src = item.get('src');
        item.thumbnail = item.get('thumbnail');
        item.thumbnailWidth = item.get('thumbnailWidth');
        item.thumbnailHeight = item.get('thumbnailHeight');
        item.tags = this.buildTags(item.get('tags'));
        item.modelTags = this.buildTags(item.get('modelTags'));
        item.isSelected = false;

        this.imgs[item.id] = item;
        return item;
    }

    buildImages (imageList) {
        if (imageList == null) {
            return [];
        }
        console.log("B",imageList);
        console.log(typeof imageList);
        var items = imageList;//.slice();
        var item;
        for (var t in items) {
            item = items[t]
            item.id = item.get('id');
            item.key = item.get('id');
            item.src = item.get('src');
            item.thumbnail = item.get('thumbnail');
            item.thumbnailWidth = item.get('thumbnailWidth');
            item.thumbnailHeight = item.get('thumbnailHeight');
            item.tags = this.buildTags(item.get('tags'));
            item.modelTags = this.buildTags(item.get('modelTags'));
            // item.isSelected = true;
        }
        return items;
    }
    
    componentWillReceiveProps(newProps){
        if(newProps.images != this.props.images){
            this.setState({
                images : newProps.images 
            })
        }
        if(newProps.todos != this.props.todos){
            this.setState({
                todos : newProps.todos 
            })
        }
    }

    render () {
        const { images, todos, toggleTodo, refetchTodoList } = this.props;
        console.log("P",images);
        console.log("S",this.state.images);
        return (
            <div className="ui main container main-content">
                <h1>Classify images</h1>
                <button
                    onClick={this.onClickSelectAll}>
                    Select all
                </button>
                <button
                    onClick={this.overwriteLabel}>
                    Overwrite
                </button>
                <button
                    onClick={this.appendLabel}>
                    Append
                </button>
                <button
                    onClick={this.nextBatch}>
                    Next
                </button>
                <br/>
                <LabelSelector
                    options={this.state.labelOptions}
                    selected={this.state.selectedLabels}
                    updateLabels={this.updateLabels.bind(this)}/> 
                <br/>
                <div style={{
                    display: "block",
                    minHeight: "1px",
                    width: "100%",
                    border: "1px solid #ddd",
                    overflow: "auto"}}>
                 <Gallery
                    images={shuffleArray(images)}
                    onSelectImage={this.onSelectImage}
                    showLightboxThumbnails={true}
                    enableLightbox={true}/> 
                </div>
            </div>
        );
    }
}
// todos: IPropTypes.listOf(IPropTypes.contains({
//     id: PropTypes.string.isRequired,
//     completed: PropTypes.bool.isRequired,
//     text: PropTypes.string.isRequired
//   })).isRequired,

ImageViewer.propTypes = {
    // images: IPropTypes.listOf(IPropTypes.contains({
    //     src: PropTypes.string.isRequired,
    //     thumbnail: PropTypes.string,
    //     caption: PropTypes.string,
    //     thumbnailWidth: PropTypes.number,
    //     thumbnailHeight: PropTypes.number,
    //     tags: IPropTypes.listOf(PropTypes.string),
    //     modelTags: IPropTypes.listOf(PropTypes.string),
    // })).isRequired,
    images: PropTypes.arrayOf(PropTypes.shape({
        src: PropTypes.string.isRequired,
        thumbnail: PropTypes.string,
        caption: PropTypes.string,
        thumbnailWidth: PropTypes.number,
        thumbnailHeight: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
        modelTags: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,    
    todos: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired
    })).isRequired,
    labelOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    selectedLabels: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
};

ImageViewer.defaultProps = {
    labelOptions: [],
    selectedLabels: [],
    // images: shuffleArray([
    //     {
    //         id: '1',
    //         src: "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg",
    //         thumbnail: "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 174,
    //         tags: ["Nature"],
    //         caption: "After Rain (Jeshu John - designerspics.com)",
    //         modelTags: []
    //     }])
    //     {
    //         src: "https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_b.jpg",
    //         thumbnail: "https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 212,
    //         caption: "Boats (Jeshu John - designerspics.com)"
    //     },
    //     {
    //         src: "https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_b.jpg",
    //         thumbnail: "https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 212,
    //         caption: "Color Pencils (Jeshu John - designerspics.com)"
    //     },
    //     {
    //         src: "https://c7.staticflickr.com/9/8546/28354329294_bb45ba31fa_b.jpg",
    //         thumbnail: "https://c7.staticflickr.com/9/8546/28354329294_bb45ba31fa_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         caption: "Red Apples with other Red Fruit (foodiesfeed.com)"
    //     },
    //     {
    //         src: "https://c6.staticflickr.com/9/8890/28897154101_a8f55be225_b.jpg",
    //         thumbnail: "https://c6.staticflickr.com/9/8890/28897154101_a8f55be225_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 183,
    //         caption: "37H (gratispgraphy.com)"
    //     },
    //     {
    //         src: "https://c5.staticflickr.com/9/8768/28941110956_b05ab588c1_b.jpg",
    //         thumbnail: "https://c5.staticflickr.com/9/8768/28941110956_b05ab588c1_n.jpg",
    //         thumbnailWidth: 240,
    //         thumbnailHeight: 320,
    //         tags: [{value: "Nature", title: "Nature"}],
    //         caption: "8H (gratisography.com)"
    //     },
    //     {
    //         src: "https://c3.staticflickr.com/9/8583/28354353794_9f2d08d8c0_b.jpg",
    //         thumbnail: "https://c3.staticflickr.com/9/8583/28354353794_9f2d08d8c0_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 190,
    //         caption: "286H (gratisography.com)"
    //     },
    //     {
    //         src: "https://c7.staticflickr.com/9/8569/28941134686_d57273d933_b.jpg",
    //         thumbnail: "https://c7.staticflickr.com/9/8569/28941134686_d57273d933_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 148,
    //         tags: [{value: "People", title: "People"}],
    //         caption: "315H (gratisography.com)"
    //     },
    //     {
    //         src: "https://c6.staticflickr.com/9/8342/28897193381_800db6419e_b.jpg",
    //         thumbnail: "https://c6.staticflickr.com/9/8342/28897193381_800db6419e_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         caption: "201H (gratisography.com)"
    //     },
    //     {
    //         src: "https://c2.staticflickr.com/9/8239/28897202241_1497bec71a_b.jpg",
    //         thumbnail: "https://c2.staticflickr.com/9/8239/28897202241_1497bec71a_n.jpg",
    //         thumbnailWidth: 248,
    //         thumbnailHeight: 320,
    //         caption: "Big Ben (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c7.staticflickr.com/9/8785/28687743710_3580fcb5f0_b.jpg",
    //         thumbnail: "https://c7.staticflickr.com/9/8785/28687743710_3580fcb5f0_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 113,
    //         tags: [{value: "People", title: "People"}],
    //         caption: "Red Zone - Paris (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c6.staticflickr.com/9/8520/28357073053_cafcb3da6f_b.jpg",
    //         thumbnail: "https://c6.staticflickr.com/9/8520/28357073053_cafcb3da6f_n.jpg",
    //         thumbnailWidth: 313,
    //         thumbnailHeight: 320,
    //         caption: "Wood Glass (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c8.staticflickr.com/9/8104/28973555735_ae7c208970_b.jpg",
    //         thumbnail: "https://c8.staticflickr.com/9/8104/28973555735_ae7c208970_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         caption: "Flower Interior Macro (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c4.staticflickr.com/9/8562/28897228731_ff4447ef5f_b.jpg",
    //         thumbnail: "https://c4.staticflickr.com/9/8562/28897228731_ff4447ef5f_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 194,
    //         caption: "Old Barn (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c2.staticflickr.com/8/7577/28973580825_d8f541ba3f_b.jpg",
    //         thumbnail: "https://c2.staticflickr.com/8/7577/28973580825_d8f541ba3f_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         caption: "Cosmos Flower Macro (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c7.staticflickr.com/9/8106/28941228886_86d1450016_b.jpg",
    //         thumbnail: "https://c7.staticflickr.com/9/8106/28941228886_86d1450016_n.jpg",
    //         thumbnailWidth: 271,
    //         thumbnailHeight: 320,
    //         caption: "Orange Macro (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c1.staticflickr.com/9/8330/28941240416_71d2a7af8e_b.jpg",
    //         thumbnail: "https://c1.staticflickr.com/9/8330/28941240416_71d2a7af8e_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         tags: [{value: "Nature", title: "Nature"}, {value: "People", title: "People"}],
    //         caption: "Surfer Sunset (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c1.staticflickr.com/9/8707/28868704912_cba5c6600e_b.jpg",
    //         thumbnail: "https://c1.staticflickr.com/9/8707/28868704912_cba5c6600e_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         tags: [{value: "People", title: "People"}, {value: "Sport", title: "Sport"}],
    //         caption: "Man on BMX (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c4.staticflickr.com/9/8578/28357117603_97a8233cf5_b.jpg",
    //         thumbnail: "https://c4.staticflickr.com/9/8578/28357117603_97a8233cf5_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         caption: "Ropeman - Thailand (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c4.staticflickr.com/8/7476/28973628875_069e938525_b.jpg",
    //         thumbnail: "https://c4.staticflickr.com/8/7476/28973628875_069e938525_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 213,
    //         caption: "Time to Think (Tom Eversley - isorepublic.com)"
    //     },
    //     {
    //         src: "https://c6.staticflickr.com/9/8593/28357129133_f04c73bf1e_b.jpg",
    //         thumbnail: "https://c6.staticflickr.com/9/8593/28357129133_f04c73bf1e_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 179,
    //         tags: [{value: "Nature", title: "Nature"}, {value: "Fauna", title: "Fauna"}],
    //         caption: "Untitled (Jan Vasek - jeshoots.com)"
    //     },
    //     {
    //         src: "https://c6.staticflickr.com/9/8893/28897116141_641b88e342_b.jpg",
    //         thumbnail: "https://c6.staticflickr.com/9/8893/28897116141_641b88e342_n.jpg",
    //         thumbnailWidth: 320,
    //         thumbnailHeight: 215,
    //         tags: [{value: "People", title: "People"}],
    //         caption: "Untitled (moveast.me)"
    //     },
    //     {
    //         src: "https://c1.staticflickr.com/9/8056/28354485944_148d6a5fc1_b.jpg",
    //         thumbnail: "https://c1.staticflickr.com/9/8056/28354485944_148d6a5fc1_n.jpg",
    //         thumbnailWidth: 257,
    //         thumbnailHeight: 320,
    //         caption: "A photo by 贝莉儿 NG. (unsplash.com)"
    //     },
    //     {
    //         src: "https://c7.staticflickr.com/9/8824/28868764222_19f3b30773_b.jpg",
    //         thumbnail: "https://c7.staticflickr.com/9/8824/28868764222_19f3b30773_n.jpg",
    //         thumbnailWidth: 226,
    //         thumbnailHeight: 320,
    //         caption: "A photo by Matthew Wiebe. (unsplash.com)"
    //     }
    // ]).splice(0,16)
};

function shuffleArray (array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
}


  const imageListQuery = gql`
  query ImageListQuery {
    imageList {
      images {
        id 
        src 
        thumbnail 
        thumbnailWidth 
        thumbnailHeight 
        tags
        modelTags 
        caption
      }
    }
  }
`;

const todoListQuery = gql`
query TodoListQuery {
  todoList {
    todos {
      id
      text
      completed
    }
  }
}
`;

const toggleTodoMutation = gql`
mutation toggleTodo($id: String!) {
  toggleTodo(id: $id) {
    completed
  }
}
`;

function convert (array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, ownProps, {
      todos: ownProps.todos,
      toggleTodo: ownProps.toggleTodo,
      refetchTodoList: ownProps.refetchTodoList,
      images: ownProps.images,
      refetchImageList: ownProps.refetchImageList
    });
  };


// export default graphql(gql`
//   query TodoAppQuery {
//     todos {
//       id
//       text
//     }
//   }
// `)(TodoApp);

const mapStateToProps = function(state){
    return {
      images: state.something,
    }
  }

export default compose(
    graphql(imageListQuery, {
        props: ({ ownProps, data }) => {
          const { loading, refetch, imageList } = data;
          console.log("IMLST", imageList);
          return {
            imageListLoading: loading,
            refetchImageList: refetch,
            images: imageList ? imageList.images : [],
            // images: fromJS(imageList ? imageList.images : []),
          };
        }
    }),
    graphql(todoListQuery, {
      props: ({ ownProps, data }) => {
        const { loading, refetch, todoList } = data;
        return {
          todoListLoading: loading,
          refetchTodoList: refetch,
          todos: todoList ? todoList.todos : [],
        };
      }
    }),
    graphql(toggleTodoMutation, {
      props: ({ ownProps, mutate }) => {
        return {
          toggleTodo: (id) => {
            mutate({ variables: { id } }).then(() => {
              ownProps.refetchTodoList();
            });
          }
        };
      }
    }),
    connect(null, null, mergeProps)
)(ImageViewer);

//export default ImageViewer;


import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gallery from './Gallery.js';
import 'react-select/dist/react-select.css';
import LabelSelector from './LabelSelector.js'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import './normalize.css';
import './index.css';
import './github-light.css';
import { Divider } from 'semantic-ui-react';
import { List } from 'semantic-ui-react';
// import { PROJECT_NAME } from '../config.js'

console.log(PROJECT_NAME)
const PROJECT_NAME = 'test_project'

class ImageViewer extends Component {
    constructor(props){
        super(props);
        console.log(props)
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
        this.buildImages = this.buildImages.bind(this);
        this.submitTags = this.submitTags.bind(this);
        this.nextBatch = this.nextBatch.bind(this);
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
        var images = this.state.images; //this.buildImages(this.state.images);//.slice();
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

    getUniqueLabelNames(labelNames) {
        return Array.from(new Set(labelNames));
    }

    makeLabels(labelNames) {
        labelNames = this.getUniqueLabelNames(labelNames);
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

    overwriteLabel () {
       var images = this.state.images.slice();
       var labelNames = this.getSelectedLabels();
        for(var i = 0; i < images.length; i++) {
            if(images[i].isSelected === true)
                images[i].tags = labelNames;
                images[i].displayTags = this.makeLabels(labelNames);
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
                    images[i].tags = labelNames;
                    images[i].displayTags = this.makeLabels(labelNames);                     
                } else {
                    var joined = images[i].tags.concat(labelNames);
                    joined = this.getUniqueLabelNames(joined);
                    images[i].tags = joined;
                    images[i].displayTags = this.makeLabels(joined);
                }
             }
         }
         this.setState({
             images: images
         });
     }

    onClickSelectAll () {
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

    submitTags() {
        var items = this.state.images.slice();
        for (var i = 0; i < items.length; i++) {
            this.props.updateImageTags(items[i].id, items[i].tags);
        }
        this.nextBatch();
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

    buildImages (imageList) {
        if (imageList == null)
            return [];
        for (var i =0; i < imageList.length; i++) {
            imageList[i].displayTags = this.buildTags(imageList[i].tags);
        }
        return imageList;
    }
    
    componentWillReceiveProps(newProps){
        if(newProps.images != this.props.images){
            this.setState({
                images : newProps.images 
            })
        }
    }

    nextBatch () {
        this.props.refetchImageList();
    }

    render () {
        const { images } = this.props;
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
                <button
                    onClick={this.submitTags}>
                    Submit
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
                    images={this.buildImages(images)}
                    onSelectImage={this.onSelectImage}
                    showLightboxThumbnails={true}
                    enableLightbox={true}/> 
                </div>
            </div>
        );
    }
}

ImageViewer.propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        project: PropTypes.string.isRequired,
        src: PropTypes.string.isRequired,
        thumbnail: PropTypes.string,
        caption: PropTypes.string,
        thumbnailWidth: PropTypes.number,
        thumbnailHeight: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
        modelTags: PropTypes.arrayOf(PropTypes.string),
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

const DEFAULT_LABELS = [
    { "label": "cat", "value": "cat"},
    { "label": "dog", "value": "dog"}
]

ImageViewer.defaultProps = {
    labelOptions: DEFAULT_LABELS,
    selectedLabels: [],
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
query ImageListQuery($project:String!) {
    imageList(project: $project) {
      images {
        id 
        project
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

const updateTagsMutation = gql`
    mutation updateImageTags($id: String!, $project: String!, $tags: [String!]) {
        updateImageTags(id: $id, project: $project, tags: $tags) {
            id
            project
            tags
        }
    }
`;


export default compose(
    graphql(imageListQuery, {
        options: (ownProps) => ({
            variables: { project: ownProps.project } 
        }),
        props: ({ data: { loading, refetch, imageList }}) => ({
            imageListLoading: loading,
            refetchImageList: refetch,
            images: imageList ? imageList.images : []
        })
    }),
    graphql(updateTagsMutation, {
        props: ({ ownProps, mutate }) => {
          return {
            updateImageTags: (id, tags) => {
              mutate({ variables: { id, tags } }).then(() => {
                return;
              });
            }
          };
        }
      })
)(ImageViewer);


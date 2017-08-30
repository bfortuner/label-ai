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
import { 
    Table, Progress, Button, Container, 
    Divider, Grid, Header, Image, Menu, 
    Segment, List
} from 'semantic-ui-react'

// import { PROJECT_NAME } from '../config.js'

console.log(PROJECT_NAME)
const PROJECT_NAME = 'test_project'

class ImageViewer extends Component {
    constructor(props){
        super(props);
        console.log("P", props);
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
            this.props.updateImageTags(items[i].id, 
                this.props.project, items[i].tags);
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

    refreshMetrics() {
        this.props.refetchMetrics();
        const { metrics } = this.props;
        this.setState({
            labeledCount : metrics.counts.trn + metrics.counts.val,
            unlabeledCount: metrics.counts.unlabeled,
            accuracy: metrics.accuracy
        })   
    }

    nextBatch () {
        this.props.refetchImageList();
        this.props.refetchMetrics();
    }

    render () {
        const { images } = this.props;
        return (
            <div className="ui main container main-content">
                <Container>
                    <Header as='h2'>Classify images</Header>
                    <Grid columns={2} stackable>
                        <Grid.Row>
                             <Grid.Column >
                            <Button.Group  attached='top' widths={1}>
                                <Button size='big'                              
                                    onClick={this.onClickSelectAll}>
                                    Select all</Button>
                                <Button size='big'
                                    onClick={this.overwriteLabel}>
                                    Assign Labels</Button>
                                <Button size='big'
                                    onClick={this.nextBatch}>
                                    Skip
                                </Button>
                                <Button size='big'
                                    onClick={this.submitTags}>
                                    Submit
                                </Button>
                                </Button.Group>
                                {/* <Button
                                onClick={this.appendLabel}>
                                Append
                                </Button> */}
                            </Grid.Column> 
                            {/* <Grid.Column floated='right' width={9}>
                                Accuracy: {this.props.metrics.accuracy.toPrecision(3)} | 
                                Labeled: {this.props.metrics.counts.trn + this.props.metrics.counts.val} | 
                                Unlabeled: {this.props.metrics.counts.unlabeled}
                            </Grid.Column> */}
                            <Grid.Column >
                            <Table basic>
                                <Table.Body>
                                <Table.Row>
                                    <Table.Cell>Accuracy: {this.props.metrics.accuracy.toPrecision(3)}</Table.Cell>
                                    <Table.Cell>Labeled: {this.props.metrics.counts.trn + this.props.metrics.counts.val}</Table.Cell>
                                    <Table.Cell>Unlabeled: {this.props.metrics.counts.unlabeled}</Table.Cell>
                                </Table.Row>
                                </Table.Body>
                            </Table>
                            </Grid.Column>       
                            {/* <Grid.Column floated='right' width={3}>
                                Accuracy: {this.props.metrics.accuracy.toPrecision(3)}
                            </Grid.Column>
                            <Grid.Column floated='right' width={3}>
                                Labeled: {this.props.metrics.counts.trn + this.props.metrics.counts.val}
                            </Grid.Column>
                            <Grid.Column floated='right' width={3}>
                                Unlabeled: {this.props.metrics.counts.unlabeled}
                            </Grid.Column>                    */}
                            </Grid.Row>
                        </Grid>
                        
                        <Grid columns={1}>
                            <Grid.Row>
                                <Grid.Column>
                                    <LabelSelector
                                    options={this.state.labelOptions}
                                    selected={this.state.selectedLabels}
                                    updateLabels={this.updateLabels.bind(this)}/> 
                                </Grid.Column>
                            </Grid.Row>
    

                <Grid.Row>
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
                </Grid.Row>
{/* 
                <Header as='h2'>Progress</Header>
                <Grid.Row>
                    <Table>
                        <Table.Body>
                        <Table.Row>
                            <Table.Cell>Accuracy: {this.props.metrics.accuracy.toPrecision(3)}</Table.Cell>
                            <Table.Cell>Labeled: {this.props.metrics.counts.trn + this.props.metrics.counts.val}</Table.Cell>
                            <Table.Cell>Unlabeled: {this.props.metrics.counts.unlabeled}</Table.Cell>
                        </Table.Row>
                        </Table.Body>
                    </Table>
                </Grid.Row> */}

              </Grid>
            </Container>
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
    metrics: PropTypes.shape({
        accuracy: PropTypes.number.isRequired,
        loss: PropTypes.number.isRequired,
        counts: PropTypes.shape({
            trn: PropTypes.number.isRequired,
            val: PropTypes.number.isRequired,
            tst: PropTypes.number,
            unlabeled: PropTypes.number.isRequired,
        })
    }),
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
    metrics: {
        accuracy: 0,
        loss: 0,
        counts: {
            trn:0,
            val:0,
            tst:0,
            unlabeled:0
        }
    }
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


const metricsQuery = gql`
query MetricsQuery($project:String!) {
    metrics(project: $project) {
        accuracy
        loss
        counts {
            trn
            val
            tst
            unlabeled
        }
    }
  }
`;

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


// http://dev.apollodata.com/react/api-queries.html#graphql-query-options
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
    graphql(metricsQuery, {
        options: (ownProps) => ({
            variables: { project: ownProps.project } 
        }),
        props: ({ data: { loading, refetch, metrics }}) => ({
            metrics: metrics,
            refetchMetrics: refetch,
        })
    }),
    graphql(updateTagsMutation, {
        props: ({ ownProps, mutate }) => {
          return {
            updateImageTags: (id, project, tags) => {
                mutate({ 
                  variables: { id, project, tags } 
                }).then(() => {
                    return;
                });
            }
          };
        }
    })
)(ImageViewer);


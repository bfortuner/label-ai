import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link } from 'react-router-dom'
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import HomeApp from './containers/Home/HomeApp';
import ImageViewer from './containers/Label/ImageViewer.js';
import Header from './containers/Header';
import Footer from './containers/Footer';
import './index.css';


const client = new ApolloClient({
  networkInterface: createNetworkInterface({ 
      //uri: 'http://24.5.150.30:5000/graphql'
      uri: 'http://10.0.0.21:5000/graphql' 
  })
});

//https://stackoverflow.com/questions/27864720/react-router-pass-props-to-handler-component
ReactDOM.render(
<ApolloProvider client={client}>
  <BrowserRouter>
    <div className="app">
      <Header/>
        <Route exact path="/" component={HomeApp}/>
        <Route path="/label" render={(props) => <ImageViewer project="test_project" {...props}/>}/>
      <Footer/>
    </div>
  </BrowserRouter>
</ApolloProvider>,
document.getElementById('root')
);
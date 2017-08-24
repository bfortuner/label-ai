import React, { Component } from 'react';
import './normalize.css';
import './App.css';
import './github-light.css';
import ImageViewer from './ImageViewer'


class App extends Component {
  render() {
    return (
      <div>
        <section className="page-header">
          <h1 className="project-name">Label.AI</h1>
          <h2 className="project-tagline">AI-accelerated image labeling for blazing fast annotation</h2>
          <a href="https://github.com/bfortuner/label-ai" className="btn">View on GitHub</a>
        </section>

        <section className="main-content">
          <p>
            Bulk classification and multi-label image annotation.
          </p>

          <h3><a id="demo" className="anchor" href="#demo" aria-hidden="true"><span aria-hidden="true" className="octicon octicon-link"></span></a>Classify</h3>

          <ImageViewer/>

          <footer className="site-footer">
            <span className="site-footer-owner"><a href="https://github.com/label-ai">label-ai</a> is maintained by <a href="https://github.com/bfortuner">Brendan Fortuner</a>.</span>

          </footer>
        </section>
      </div>
    );
  }
}

export default App;

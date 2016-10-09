var lunr = require('lunr'),
    React = require('react');

var featureIconPrefix = 'images/feature_icons/';

var Explore = React.createClass({
    loadDataFromServer: function() {
      $.ajax({
        url: 'data/indexed_data.json',
        dataType: 'json',
        cache: false,
        success: function(indexed_data) {
          var data = indexed_data.data,
              index = lunr.Index.load(indexed_data.index);
          this.setState({data: data, filteredData: data, searchIndex: index});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(status, err.toString());
        }.bind(this)
      });
    },

    getInitialState: function () {
      return {
        data: [],
        filteredData: [],
        selectedFeatures: [],
        searchTerm: ""
      };
    },

    componentDidMount: function() {
      this.loadDataFromServer();
    },

    filterData: function () {
      var searchTerm = this.state.searchTerm,
          selectedFeatures = this.state.selectedFeatures,
          filteredData, searchResults, ids;
      if (searchTerm === '') {
        filteredData = this.state.data;
      } else {
        // debugger;
        searchResults = this.state.searchIndex.search(searchTerm);
        filteredData = searchResults.map((result) => {
          var datum = this.state.data[result.ref];
          datum.score = result.score;
          return datum;
        }).sort((a, b) => {a.score - b.score});;
      }
      // If any features are selected
      if (selectedFeatures.length > 0) {
        filteredData = filteredData.filter(function (datum) {
          // Must contain all selected features
          for (var i = 0; i < selectedFeatures.length; i++) {
            if (datum.features.indexOf(selectedFeatures[i]) === -1) {
              return false;
            }
          }
          return true;
        });
      }
      this.setState({filteredData: filteredData});
    },

    allFeatures: {
      evaluations: {
        description: "Evaluations",
        icon_url: featureIconPrefix + "evaluations.png"
      },
      grievance_mechanism: {
        description: "Grievance Mechanism",
        icon_url: featureIconPrefix + "grievance_mechanism.png"
      },
      human_rights_law_reference: {
        description: "Human Rights Law Reference",
        icon_url: featureIconPrefix + "human_rights_law_reference.png"
      },
      human_rights_reference: {
        description: "Human Rights Reference",
        icon_url: featureIconPrefix + "human_rights_reference.png"
      },
      involvement_of_affected_communities: {
        description: "Involvement of Affected Communities",
        icon_url: featureIconPrefix + "involvement_of_affected_communities.png"
      },
      reports: {
        description: "Reports",
        icon_url: featureIconPrefix + "reports.png"
      },
      sanctions: {
        description: "Sanctions",
        icon_url: featureIconPrefix + "sanctions.png"
      },
      standards: {
        description: "Standards",
        icon_url: featureIconPrefix + "standards.png"
      }
    },

    generateFeatureBadges: function(features) {
      var size = 40,
          allFeatures = this.allFeatures;
      return features.map(function (feature, i) {
        var icon_url = allFeatures[feature]['icon_url'],
            description = allFeatures[feature]['description'];
        return (
          <img src={icon_url} alt={description} title={description} height={size} width={size} key={i} />
        );
      });
    },

    renderTableRow: function (datum, i) {
      return (
        <div className="row msi-info" key={i}>
          <div className="large-9 columns">
            <div>
              <h3>{datum.name}</h3>
            </div>
            <div>
              <h5>Launched {datum.launched}</h5>
            </div>
            <div>
              {datum.mission}
            </div>
            <div>
              <h4>Stakeholders</h4>
              {datum.stakeholders}
            </div>
          </div>
          <div className="large-2 columns end features-list">
            <h4>Features</h4>
            {this.generateFeatureBadges(datum.features)}
          </div>
        </div>
      );
    },

    handleSearchTermChange: function (event) {
      this.setState({
        searchTerm: event.target.value
      }, this.filterData);
    },

    handleToggleFeature: function (featureName) {
      var selectedFeatures = this.state.selectedFeatures;
      var index = selectedFeatures.indexOf(featureName)
      if (index === -1) {
        selectedFeatures = selectedFeatures.concat(featureName);
      } else {
        selectedFeatures.splice(index, 1);
      }
      this.setState({selectedFeatures: selectedFeatures}, this.filterData);
    },

    renderSearchResultsSummary: function () {
      var filteredByElement, featuresText, selectedFeatures = this.state.selectedFeatures;
      if (this.state.searchTerm){
        filteredByElement = (
          <div>
            Filtered by seach term <span className="search-term">{this.state.searchTerm}</span>
          </div>
        );
      }
      if (selectedFeatures.length) {
        featuresText = 'With the feature' + (selectedFeatures.length === 1 ? ' ' : 's ');
        for (var i = 0; i < selectedFeatures.length; i++) {
            featuresText += '<span class="search-term">' + this.allFeatures[selectedFeatures[i]].description + '</span>';
            if (i < selectedFeatures.length - 2) {
              featuresText += ', ';
            } else if (i === selectedFeatures.length - 2) {
              featuresText += ' and ';
            }
        }
      } else {
        featuresText = 'Matching any features'
      }
      return (
        <div className="large-4 large-centered columns text-center results-summary">
          <h2>{this.state.filteredData.length} Results</h2>
          {filteredByElement}
          <div dangerouslySetInnerHTML={{__html: featuresText}}>
          </div>
        </div>
      );
    },

    renderSearchBar: function () {
      var allFeatures = this.allFeatures;
      var handleToggleFeature = this.handleToggleFeature;
      var selectedFeatures = this.state.selectedFeatures;
      var featureNodes = Object.keys(allFeatures).map(function (featureName, index) {
        var description = allFeatures[featureName]['description'],
            icon_url = allFeatures[featureName]['icon_url'],
            classes = "small-3 columns feature-selector-feature";
        if (selectedFeatures.indexOf(featureName) !== -1) {
          classes += " active";
        }
        return (
          <div className={classes} key={index} onClick={() => {handleToggleFeature(featureName)}}>
            <img src={icon_url} alt={description} title={description} />
            <div>
              {description}
            </div>
          </div>
        );
      });
      return (
        <div key={-1} className="search-container row">
          <div className="row">
            <div className="large-7 large-centered columns">
              <input className="search-box" type="search" placeholder="Name of MSI and mission" onChange={this.handleSearchTermChange}/>
            </div>
          </div>
          <div className="row">
            <div className="large-8 large-centered columns">
              <div className="row collapse feature-selector">
                <div className="small-6 columns">
                  {featureNodes.slice(0, 4)}
                </div>
                <div className="small-6 columns">
                  {featureNodes.slice(4, 8)}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {this.renderSearchResultsSummary()}
          </div>
        </div>
      );
    },

    render: function () {
      var generateFeatureBadges = this.generateFeatureBadges;
      var renderTableRow = this.renderTableRow;
      var dataNodes = this.state.filteredData.map(function (datum, i) {
        return renderTableRow(datum, i);
      });
      dataNodes.unshift(this.renderSearchBar());
      return (
        <div className={"msi-info-container tab" + (this.props.activeTab ? ' active-tab' : '')}>
          {dataNodes}
        </div>
      );
    }
});

module.exports = Explore;

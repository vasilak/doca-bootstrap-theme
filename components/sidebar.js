const React = require('react');
const Component = require('react-pure-render/component');
const ImmutablePropTypes = require('react-immutable-proptypes');
const _ = require('lodash');
const offsetTop = require('./helpers').offsetTop;


const getLinks = (links, search) =>
  links
    .filter(link => {
      if (link.get('private')) return false;
      if (search &&
        link.get('title').toLowerCase().indexOf(search.toLowerCase()) === -1) {
        return false;
      }
      return true;
    });

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var createSideBar = function(schemas, search, activeId) {
  var schemasList = schemas.filter(function (schema) {
    return !schema.get('hidden');
  }).valueSeq();

  var schemasByNamespace = {};
  // Get event namespaces
  schemasList.forEach((schema) => {
    // Check if the schema should be shown (based on the current search)
    if (search && schema.get('title').toLowerCase().indexOf(search.toLowerCase()) === -1) {
      return;
    }

    // Each event should be prefixed by the namespace, then a dot ('.') and then the event name
    var indexOfDot = schema.get('title').indexOf('.');
    if (indexOfDot > -1) {
      var title = schema.get('title').slice(0, indexOfDot);
      if (!schemasByNamespace[title]) {
        schemasByNamespace[title] = [];
      }
      schemasByNamespace[title].push(schema);
    }
  });

  var elements = [];
  for (var namespace in schemasByNamespace) {
    var namespacedSchemas = schemasByNamespace[namespace];

    var element = React.createElement(
      'ul',
      { className: 'sidebar-nav', key: namespace },
      React.createElement(
        'li',
        { className: 'sidebar-category' },
        capitalizeFirstLetter(namespace)
      ),
      namespacedSchemas.map(function (schema) {
        return React.createElement(
          'li',
          {
            key: schema.get('html_id'),
            className: schema.get('html_id') === activeId ? 'active' : ''
          },
          React.createElement(
            'a',
            { href: '#' + schema.get('html_id') },
            schema.get('title')
          )
        );
      })
    );

    elements.push(element);
  }

  return elements;
};

class Sidebar extends Component {

  static propTypes = {
    schemas: ImmutablePropTypes.list.isRequired,
  };

  constructor() {
    super();
    this.handleScroll = _.throttle(this.handleScroll, 150);
  }

  state = {
    activeId: null,
    search: '',
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('keydown', this.handleKeydown);
  }

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value });
  }

  cancelSearch = () => {
    this.setState({ search: '' });
  }

  handleKeydown = (e) => {
    // ESC
    if (e.keyCode === 27) {
      this.cancelSearch();
    }
  }

  // highlighting of sidebar links and section toggling
  handleScroll = () => {
    // list of all link #ids
    const ids = this.props.schemas.reduce((result, schema) => {
      let res = result;
      if (!schema.get('hidden')) {
        res = res.concat([`${schema.get('html_id')}-properties`]);
      }
      return res.concat(
        schema
          .get('links')
          .filter(link => !link.get('private'))
          .map(link => link.get('html_id'))
          .toJS()
      );
    }
    , []);

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop ||
                      document.body.scrollTop || 0;

    // finds the first link that has top offset > top scroll position and breaks
    let activeId = null;
    // a small offset so the coming section is highlighted a bit sooner
    // before its main title touches the top of browser and starts disappearing
    const VERTICAL_OFFSET = 30;
    for (let i = 0; i < ids.length; i++) {
      if (offsetTop(document.getElementById(ids[i])) - VERTICAL_OFFSET > scrollTop) {
        activeId = ids[i > 0 ? i - 1 : i];
        break;
      }
    }

    // updates URL bar
    if (global.history) {
      global.history.replaceState({ id: activeId }, activeId, `#${activeId}`);
    }

    this.setState({ activeId });
  }

  render() {
    const { schemas } = this.props;
    const { activeId, search } = this.state;

    return (
      <nav id="sidebar-wrapper">
        <div className="search">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={this.handleSearchChange}
          />
        </div>

        {createSideBar(schemas, search, activeId)}
      </nav>
    );
  }

}

module.exports = Sidebar;

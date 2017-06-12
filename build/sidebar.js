'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var React = require('react');
var Component = require('react-pure-render/component');
var ImmutablePropTypes = require('react-immutable-proptypes');
var _ = require('lodash');
var offsetTop = require('./helpers').offsetTop;

var getLinks = function getLinks(links, search) {
  return links.filter(function (link) {
    if (link.get('private')) return false;
    if (search && link.get('title').toLowerCase().indexOf(search.toLowerCase()) === -1) {
      return false;
    }
    return true;
  });
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var createSideBar = function createSideBar(schemas, search, activeId) {
  var schemasList = schemas.filter(function (schema) {
    return !schema.get('hidden');
  }).valueSeq();

  var schemasByNamespace = {};
  // Get event namespaces
  schemasList.forEach(function (schema) {
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

    var element = React.createElement('ul', { className: 'sidebar-nav', key: namespace }, React.createElement('li', { className: 'sidebar-category' }, capitalizeFirstLetter(namespace)), namespacedSchemas.map(function (schema) {
      return React.createElement('li', {
        key: schema.get('html_id'),
        className: schema.get('html_id') === activeId ? 'active' : ''
      }, React.createElement('a', { href: '#' + schema.get('html_id') }, schema.get('title')));
    }));

    elements.push(element);
  }

  return elements;
};

var Sidebar = function (_Component) {
  (0, _inherits3.default)(Sidebar, _Component);

  function Sidebar() {
    (0, _classCallCheck3.default)(this, Sidebar);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Sidebar.__proto__ || (0, _getPrototypeOf2.default)(Sidebar)).call(this));

    _this.state = {
      activeId: null,
      search: ''
    };

    _this.handleSearchChange = function (e) {
      _this.setState({ search: e.target.value });
    };

    _this.cancelSearch = function () {
      _this.setState({ search: '' });
    };

    _this.handleKeydown = function (e) {
      // ESC
      if (e.keyCode === 27) {
        _this.cancelSearch();
      }
    };

    _this.handleScroll = function () {
      // list of all link #ids
      var ids = _this.props.schemas.reduce(function (result, schema) {
        var res = result;
        if (!schema.get('hidden')) {
          res = res.concat([schema.get('html_id') + '-properties']);
        }
        return res.concat(schema.get('links').filter(function (link) {
          return !link.get('private');
        }).map(function (link) {
          return link.get('html_id');
        }).toJS());
      }, []);

      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // finds the first link that has top offset > top scroll position and breaks
      var activeId = null;
      // a small offset so the coming section is highlighted a bit sooner
      // before its main title touches the top of browser and starts disappearing
      var VERTICAL_OFFSET = 30;
      for (var i = 0; i < ids.length; i++) {
        if (offsetTop(document.getElementById(ids[i])) - VERTICAL_OFFSET > scrollTop) {
          activeId = ids[i > 0 ? i - 1 : i];
          break;
        }
      }

      // updates URL bar
      if (global.history) {
        global.history.replaceState({ id: activeId }, activeId, '#' + activeId);
      }

      _this.setState({ activeId: activeId });
    };

    _this.handleScroll = _.throttle(_this.handleScroll, 150);
    return _this;
  }

  (0, _createClass3.default)(Sidebar, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.addEventListener('scroll', this.handleScroll);
      window.addEventListener('keydown', this.handleKeydown);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('keydown', this.handleKeydown);
    }

    // highlighting of sidebar links and section toggling

  }, {
    key: 'render',
    value: function render() {
      var schemas = this.props.schemas;
      var _state = this.state,
          activeId = _state.activeId,
          search = _state.search;


      return React.createElement(
        'nav',
        { id: 'sidebar-wrapper' },
        React.createElement(
          'div',
          { className: 'search' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search...',
            value: search,
            onChange: this.handleSearchChange
          })
        ),
        createSideBar(schemas, search, activeId)
      );
    }
  }]);
  return Sidebar;
}(Component);

Sidebar.propTypes = {
  schemas: ImmutablePropTypes.list.isRequired
};


module.exports = Sidebar;
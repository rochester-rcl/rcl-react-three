/* @flow */
import React, { Component } from "react";
// semantic-ui-react
import { Accordion, Button, Icon } from "semantic-ui-react";

// lodash
import lodash from "lodash";

import { GROUP, COMPONENT } from "../constants/application";

const e = React.createElement;

export default class ThreeGUI {
  components;
  layouts;
  constructor() {
    this.components = {};
    this.layouts = {};
  }

  registerLayout(name, layout) {
    this.layouts[name] = layout;
  }

  registerComponent(name, component) {
    this.components[name] = component;
  }

  removeLayout(name) {
    if (this.layouts[name]) {
      delete this.layouts[name];
      return true;
    } else {
      return false;
    }
  }

  removeComponent(name) {
    if (this.components[name]) {
      delete this.components[name];
      return true;
    } else {
      return false;
    }
  }

  getComponent(name) {
    if (this.components[name]) {
      return this.components[name];
    } else {
      return false;
    }
  }

  getLayout(name) {
    if (this.layouts[name]) {
      return this.layouts[name];
    } else {
      return false;
    }
  }
}

export class ThreeGUIGroup {
  name;
  components;
  constructor(name) {
    this.name = name;
    this.components = [];
  }

  addComponent(
    name,
    component,
    componentProps
  ) {
    this.components.push({
      name: name,
      type: COMPONENT,
      component: component,
      props: { ...componentProps, key: lodash.uniqueId() }
    });
  }

  addGroup(name, component) {
    this.components.push({
      name: name,
      type: GROUP,
      component: component,
      props: null,
      enabled: true
    });
  }

  remove(name) {
    let index = this.components.findIndex(component => {
      return component.name === name;
    });
    if (index > -1) {
      this.components.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  find(name) {
    let index = this.components.findIndex(component => {
      return component.name === name;
    });
    if (index !== -1) {
      return this.components[index];
    } else {
      return false;
    }
  }

  _renderGroup(group) {
    return group.components.map(element => {
      if (element.type === GROUP) {
        return (
          <div className={"three-gui-group " + element.name}>
            <h4 className="three-gui-group-title">{element.name}</h4>
            {this._renderGroup(element.component)}
          </div>
        );
      } else {
        return e(element.component, element.props, null);
      }
    });
  }

  render() {
    return this._renderGroup(this);
  }
}

// Flat Layout
// Meant for a single group!
export class ThreeGUILayout extends Component {
  state = {};
  constructor(props) {
    super(props);
  }

  render() {
    const { group, groupClass } = this.props;
    return <div className={groupClass}>{group.render()}</div>;
  }
}

// Nested Layout w/ Collapsible Panel
// Meant for a group of groups!
export class ThreeGUIPanelLayout extends ThreeGUILayout {
  state = {
    activeIndex: -1,
    menuExpanded: false,
    transitionRunCallback: null,
    transitionEndCallback: null
  };
  constructor(props) {
    super(props);
    this.selectTool = this.selectTool.bind(this);
    this.expandMenu = this.expandMenu.bind(this);
    this.handleMenuTransitionEnd = this.handleMenuTransitionEnd.bind(this);
    this.handleMenuTransitionRun = this.handleMenuTransitionRun.bind(this);
    this.transitionDuration = 0;
  }

  componentDidMount() {
    const { innerRef } = this.props;
    if (innerRef && innerRef.current) {
      innerRef.current.addEventListener(
        "transitionend",
        this.handleMenuTransitionEnd
      );
      this.transitionDuration = parseFloat(
        getComputedStyle(innerRef.current).transitionDuration.split("s")[0]
      );
    }
  }

  componentWillUnmount() {
    const { innerRef } = this.props;
    innerRef.current.removeEventListener(
      "transitionend",
      this.handleMenuTransitionEnd
    );
  }

  handleMenuTransitionEnd() {
    const { menuExpanded, transitionEndCallback } = this.state;
    if (transitionEndCallback) {
      transitionEndCallback(menuExpanded);
    }
  }

  handleMenuTransitionRun(event) {
    const { transitionRunCallback } = this.state;
    if (transitionRunCallback) {
      transitionRunCallback(this.transitionDuration);
    }
  }

  selectTool(index) {
    if (this.state.activeIndex === index) {
      this.setState({ activeIndex: -1 });
    } else {
      this.setState({ activeIndex: index });
    }
  }

  expandMenu(callback, transitionRunCallback) {
    this.setState({
      transitionEndCallback: callback,
      transitionRunCallback: transitionRunCallback,
      menuExpanded: !this.state.menuExpanded
    });
  }

  render() {
    const { activeIndex, menuExpanded } = this.state;
    let {
      menuClass,
      dropdownClass,
      elementClass,
      groupClass,
      group,
      innerRef
    } = this.props;
    return (
      <div
        ref={innerRef}
        className={(menuClass += menuExpanded ? " expanded" : " collapsed")}
      >
        <Accordion
          className={
            (dropdownClass += menuExpanded ? " expanded" : " collapsed")
          }
          inverted
        >
          {group.components.map((group, index) => (
            <div key={index} className={groupClass}>
              <Accordion.Title
                active={activeIndex === index}
                key={index}
                onClick={() => this.selectTool(index)}
              >
                <h3>
                  <Icon name="dropdown" />
                  {group.name}
                </h3>
              </Accordion.Title>
              <Accordion.Content active={activeIndex === index}>
                {group.component.render()}
              </Accordion.Content>
            </div>
          ))}
        </Accordion>
      </div>
    );
  }
}

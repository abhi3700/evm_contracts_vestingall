import React, { Component, Fragment } from "react";
import ERC20Mint from "../components/token/ERC20/ERC20mint";

class HomePage extends Component {
  render() {
    return (
      <Fragment>
        <ERC20Mint />   
      </Fragment>
    );
  }
}

export default HomePage;

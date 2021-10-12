import React from "react";
import Demo from "../containers/templateConfig/mainLayout";
import { library } from "@fortawesome/fontawesome-svg-core";

import fontAwesomeIcon from "../utility/icons/fontawesome";
library.add(fontAwesomeIcon);

window.$ = window.jQuery = require("jquery");

const App = () => <Demo />;

export default App;

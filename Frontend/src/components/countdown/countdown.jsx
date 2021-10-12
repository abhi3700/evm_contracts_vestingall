import React, { Component } from 'react';
import moment from 'moment'

class Countdown extends Component {
  state = {
    days: undefined,
    hours: undefined,
    minutes: undefined,
    seconds: undefined
  }
  componentDidMount() {
    this.interval = setInterval(() => {
      const { timeTillDate, timeFormat } = this.props;
      const then = moment(timeTillDate, timeFormat);
      const now = moment();
      const countdown = moment(then - now);
      const days = countdown.format('D');
      const hours = countdown.format('HH');
      const minutes = countdown.format('mm');
      const seconds = countdown.format('ss');

      this.setState({ days, hours, minutes, seconds });
    }, 1000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  render() {
    const { days, hours, minutes, seconds } = this.state;
    return (
      <div className="btc_timer_section_wrapper">
        <div id="clockdiv">
          <div>
            <span className="days">{days}</span>
            <div className="smalltext">Days</div>
          </div>
          <div>
            <span className="hours">{hours}</span>
            <div className="smalltext">Hours</div>
          </div>
          <div>
            <span className="minutes">{minutes}</span>
            <div className="smalltext">Minutes</div>
          </div>
          <div>
            <span className="seconds">{seconds}</span>
            <div className="smalltext">Seconds</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Countdown;
import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group'

class StudentsOnlineList extends Component {

  render = () => {

    const studentsOnline = this.props.students.map((student) =>
      <li class="list-group-item list-group-item-success">{student.name}</li>
    );

    if (this.props.students.length === 0) {
      return 'Students will automatically appear as they sign in....';
    } else {
      return (
        <ul class="list-group">
        <CSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={1000}
          >
          {studentsOnline}
          </CSSTransitionGroup>
        </ul>
      )
    };
  }
}

export default StudentsOnlineList;
import React, { Component } from 'react';
import { API_WS_ROOT } from '../secrets';
import ActionCable from 'actioncable';
import StudentsOnlineList from './studentsOnlineList';
import StudentStatsTable from './studentStatsTable';
import TestTimer from './testTimer';
import { CSSTransitionGroup } from 'react-transition-group'


class RealTimeTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
       students: [],
      testStart: null,
        testEnd: null,
  totalTestTime: null
    }
  }

  componentDidMount = () => {
    this.createSocket();
  }

  createSocket() {
    let cable = ActionCable.createConsumer(`${API_WS_ROOT}/cable`);

    this.teacherChannel = cable.subscriptions.create ({
      channel: 'TeachersChannel'
    }, {
      connected: () => {},
      received: (data) => {
        console.log(data)
        const studentId = data[0];
        const student = this.studentFinder(studentId)
//  This is for question answers, not used yet
//  Not fully sure how to build yet either
//  I'm using the length of the data array for identification
        if (data.length === 5) {
          console.log(student)
          if (student !== false) {
            const category = data[1]
            const answer = data[3]
            const level = data[2]
            let studentList = [...this.state.students]
            studentList[student][category][level].push(answer)
            this.setState({students: studentList})
            console.log(this.state.students)
          }
//  For initial Student Online List
        } else if (data.length === 2) {
          if (!student) {
            const newStudent = {    id: studentId,
                                  name: data[1],
                                   '1': [ [], [], [] ],
                                   '2': [ [], [], [] ],
                                   '3': [ [], [], [] ],
                                   '4': [ [], [], [] ]
                                  };
            let studentList = [...this.state.students, newStudent]
            this.setState({students: studentList})
          }
        }
      },
      startTest: function(studentID) {
        this.perform('start_test', {id: studentID});
      },
      sendMessage: function(studentID, message) {
        this.perform('send_message', {      id: studentID,
                                       message: message
                                     });
      },
      endTest: function(studentID) {
        this.perform('end_test', { id: studentID });
      },
      pauseTest: function(studentID, pause) {
        this.perform('pause_test', {    id: studentID,
                                     pause: pause
                                   });
      }
    });
  }

  studentFinder = (studentID) => {
    const index = this.state.students.findIndex(student => student.id === studentID)
    if (index === -1 ) {
      return false;
    }
    return index;
  }

  startTest = () => {
    this.state.students.map((student) => {
      this.teacherChannel.startTest(student.id)
    })
    this.setState({testStart: "go"})
  }

  sendMessage = (studentID, message) => {
    this.teacherChannel.sendMessage(studentID, message)
  }

  endTest = () => {
    this.setState({ testEnd: true })
    this.state.students.map((student) => {
      this.teacherChannel.endTest(student.id)
    })
  }

  pauseTest = (pause) => {
    this.state.students.map((student) => {
      this.teacherChannel.pauseTest(student.id, pause)
    })
  }

  totalTestTimeSet = (time) => {
    this.setState({ totalTestTime: time })
  }


  render = () => {
    if (this.state.testEnd) {
      return (
        <div>
          <h2>Final Student Results: <span class="badge badge-secondary">{this.props.roomID}</span></h2>
          <TestTimer
            testTime={this.props.testTime}
            pauseTest={this.pauseTest}
            testEnd={this.state.testEnd}
            totalTime={this.totalTestTimeSet}
            totalTestTime={this.state.totalTestTime}
          />
          <StudentStatsTable
            students={this.state.students}
            sendMessage={this.sendMessage}
            testEnd={this.state.testEnd}
          />
        </div>
      )
    } else if (this.state.testStart) {
      return (
        <div>
          <h2>Real Time Student Results: <span class="badge badge-secondary">{this.props.roomID}</span></h2>
          <TestTimer
            testTime={this.props.testTime}
            pauseTest={this.pauseTest}
            testEnd={this.state.testEnd}
          />
          <StudentStatsTable
            students={this.state.students}
            sendMessage={this.sendMessage}
          />
          <button onClick={this.endTest}> End Test </button>
        </div>
      )
    } else {
      return (
        <div>
          <h1> Please write {this.props.roomID} on the board! </h1>
          <h3> Online Students </h3>


          <StudentsOnlineList students={this.state.students} />
          <br></br>


          <button class="btn btn-primary" onClick={this.startTest}> Start Test </button>
        </div>
      )
    }
  }


}

export default RealTimeTest;
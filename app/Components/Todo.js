import React, {PropTypes, Component} from 'react';
import {render} from 'react-dom';

// const Todo = (props) => {     debugger;     return (         <li
// onClick={props.changeStatus}>             {props.note.text} <button
// onClick={props.deleteTodo}>                 Delete </button>         </li>  )
// }

class Todo extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            isEditing: false
        }
    }
    editClick() {
        this.setState({isEditing: true});
    }
    cancelClick() {
        this.setState({isEditing: false});
    }
    renderNotes() {
        if (this.state.isEditing) {
            return (
                <form>
                    <input type="text" defaultValue={this.props.note.text} ref="editNote"/>
                </form>
            );
        }
        return (
            <div onClick={this.props.changeStatus}>{this.props.note.text}</div>
        );
    }
    onEdit(e) {
        this
            .props
            .editTodo(this.props.note.id, this.refs.editNote.value);
        this.setState({isEditing: false});
    }
    renderActions() {
        if (this.state.isEditing) {
            return (
                <div>
                    <button
                        onClick={this
                        .onEdit
                        .bind(this)}>
                        Save
                    </button>
                    <button
                        onClick={this
                        .cancelClick
                        .bind(this)}>
                        Cancel
                    </button>
                </div>
            );
        }
        return (
            <div>
                <button onClick={this.props.deleteTodo}>
                    Delete
                </button>
                <button
                    onClick={this
                    .editClick
                    .bind(this)}>
                    Edit
                </button>
            </div>
        );
    }
    render() {
        return (
            <li >
                {this.renderNotes()}
                {this.renderActions()}
            </li>
        );
    }
}

Todo.propTypes = {
    note: PropTypes.shape({id: PropTypes.number.isRequired, text: PropTypes.string.isRequired, completed: PropTypes.bool.isRequired}),
    changeStatus: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    editTodo: PropTypes.func.isRequired
}

export default Todo
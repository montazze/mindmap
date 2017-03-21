import * as React from 'react';
import { events } from '../../managers';
import { undoMiddleware } from '../../store/middlewares/undo';
import { PUSH_UNDO_STACK, UNDO_OR_REDO_TRIGGERED } from '../../constants/EventTags';

interface HeaderState {
  hasUndo: boolean;
  hasRedo: boolean;
}

export default class Header extends React.Component<void, HeaderState> {

  constructor() {
    super();

    this.state = {
      hasUndo: false,
      hasRedo: false
    }
  }

  invokeUndo() {
    setTimeout(() => {
      undoMiddleware.undo();
      this.setState({
        hasUndo: undoMiddleware.hasUndo(),
        hasRedo: true
      });
    }, 0)
  }

  invokeRedo() {
    setTimeout(() => {
      undoMiddleware.redo();
      this.setState({
        hasUndo: true,
        hasRedo: undoMiddleware.hasRedo()
      });
    }, 0)
  }

  componentDidMount() {
    events.on(PUSH_UNDO_STACK, () => {
      this.setState({hasUndo: true, hasRedo: undoMiddleware.hasRedo()});
    });

    events.on(UNDO_OR_REDO_TRIGGERED, () => {
      this.setState({hasUndo: undoMiddleware.hasUndo(), hasRedo: undoMiddleware.hasRedo()});
    })
  }

  render() {

    const undoBtnProps = {
      className: "primary-button",
      disabled: !this.state.hasUndo,
      onClick: () => this.invokeUndo()
    };

    const redoBtnProps = {
      className: "primary-button",
      disabled: !this.state.hasRedo,
      onClick: () => this.invokeRedo()
    };

    return (
      <div className="header">
        <button {...undoBtnProps}>Undo</button>
        <button {...redoBtnProps}>Redo</button>
      </div>
    );
  }
}
require('./RangeSlider.scss');
var React = require('react');
var PureRenderMixin = require('react/addons').PureRenderMixin;

function relativeMousePos(e) {
    var mouseX = e.clientX || e.touches[0].clientX;
    var rect = e.currentTarget.childNodes[0].getBoundingClientRect();
    var left = mouseX - rect.left;
    return left / rect.width;
}

var Slider = React.createClass({
    mixins: [PureRenderMixin],
    getInitialState() {
        return {
            start: 0,
            end: 1,
            dragging: null,
            skipDrag: false,
        };
    },
    getDefaultProps() {
        return {
            onSlide: function() {}
        };
    },
    closerElement(pos) {
        return (Math.abs(this.state.start - pos) < Math.abs(this.state.end - pos)) ? 'start' : 'end';
    },
    posState(e) {
        e.preventDefault();
        var s = this.state;
        var pos = relativeMousePos(e);
        var type = this.closerElement(pos);
        if (type === 'start') {
            return {start: Math.min(Math.max(pos, 0), s.end)};
        }
        if (type === 'end') {
            return {end: Math.min(Math.max(pos, s.start), 1)};
        }
    },
    drag(e) {
        if (this.state.dragging && !this.state.skipDrag) {
            var newState = this.posState(e);
            newState.skipDrag = true;
            this.setSliderState(newState);
            window.requestAnimationFrame(() => this.setState({skipDrag: false}));
        }
    },
    startDragging(e) {
        var newState = this.posState(e);
        if ('start' in newState) {
            newState.dragging = 'start';
        } else {
            newState.dragging = 'end';
        }
        this.setSliderState(newState);
    },
    stopDragging(e) {
        if (this.state.dragging) {
            var newState = this.posState(e);
            newState.dragging = null;
            this.setSliderState(newState);
        }
    },
    mouseEvents() {
        return {
             onMouseDown: this.startDragging,
             onTouchStart: this.startDragging,
             onMouseUp: this.stopDragging,
             onTouchEnd: this.stopDragging,
             onMouseLeave: this.stopDragging,
             onMouseMove: this.drag,
             onTouchMove: this.drag
        };
    },
    barStyles() {
        return {
            left: this.state.start * 100 + '%',
            width: (this.state.end - this.state.start) * 100 + '%'
        };
    },
    setSliderState(updates) {
        if (updates.start !== undefined) {
            this.props.onSlide({start: updates.start});
        } else if (updates.end !== undefined) {
            this.props.onSlide({end: updates.end});
        }
        this.setState(updates);
    },
    render() {
        return (
        <div className='slider' {...this.mouseEvents()}>
            <div className="slider-bar">
                <div className="slider-bar-active" style={this.barStyles()}/>
            </div>
        </div>
        );
    }
});

module.exports = Slider;

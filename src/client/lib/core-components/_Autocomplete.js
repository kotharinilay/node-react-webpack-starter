'use strict';

/*************************************
 * Autocomplete dropdown component
 * It's only for wrapper component of Autocomplete
 * *************************************/

const React = require('react')

let _debugStates = []

let Autocomplete = React.createClass({

    propTypes: {
        value: React.PropTypes.any,
        onChange: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        renderMenu: React.PropTypes.func,
        menuStyle: React.PropTypes.object,
        wrapperProps: React.PropTypes.object,
        wrapperStyle: React.PropTypes.object,
        autoHighlight: React.PropTypes.bool,
        onMenuVisibilityChange: React.PropTypes.func,
        open: React.PropTypes.bool,
        debug: React.PropTypes.bool,
    },

    getDefaultProps() {
        return {
            value: '',
            wrapperProps: {},
            wrapperStyle: {
                display: 'inline-block',
                width: '100%'
            },
            onChange() { },
            onSelect(value, item) { },
            renderMenu(items, value, style) {
                return <div style={this.menuStyle} children={items} />
            },
            matchStateToTerm() { return true },
            menuStyle: {
                overflow: 'auto',
                border: '1px solid #ddd',
                position: 'absolute',
                width: '100%',
                background: '#ffffff',
                maxHeight: '200px',
                zIndex: '9',
                borderTop: '0'
            },
            autoHighlight: true,
            onMenuVisibilityChange() { },
        }
    },

    getInitialState() {
        return {
            isOpen: false,
            highlightedIndex: null,
            error: this.props.eReq,
            value: this.props.value
        }
    },

    componentWillMount() {
        this._ignoreBlur = false
        this._performAutoCompleteOnUpdate = false
        this._performAutoCompleteOnKeyUp = false
    },

    componentWillReceiveProps(nextProps) {
        this._performAutoCompleteOnUpdate = true
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isOpen === true && prevState.isOpen === false)
            this.setMenuPositions()

        if (this.state.isOpen && this._performAutoCompleteOnUpdate) {
            this._performAutoCompleteOnUpdate = false
            this.maybeAutoCompleteText()
        }

        this.maybeScrollItemIntoView()
        if (prevState.isOpen !== this.state.isOpen) {
            this.props.onMenuVisibilityChange(this.state.isOpen)
        }
    },

    maybeScrollItemIntoView() {
        if (this.state.isOpen === true && this.state.highlightedIndex !== null) {
            var itemNode = this.refs[`item-${this.state.highlightedIndex}`]
            var menuNode = this.refs.menu
        }
    },

    handleKeyDown(event) {
        if (this.keyDownHandlers[event.key])
            this.keyDownHandlers[event.key].call(this, event)
        else {
            this.setState({
                highlightedIndex: null,
                isOpen: true,
                error: null
            })
        }
    },

    handleChange(event) {
        this._performAutoCompleteOnKeyUp = true
        this.setState({ value: event.target.value });
        this.props.onChange(event, event.target.value);
    },

    handleKeyUp() {
        if (this._performAutoCompleteOnKeyUp) {
            this._performAutoCompleteOnKeyUp = false
            this.maybeAutoCompleteText()
        }
    },

    keyDownHandlers: {
        ArrowDown(event) {
            event.preventDefault()
            const itemsLength = this.getFilteredItems().length
            if (!itemsLength) return
            var { highlightedIndex } = this.state
            var index = (
                highlightedIndex === null ||
                highlightedIndex === itemsLength - 1
            ) ? 0 : highlightedIndex + 1
            this._performAutoCompleteOnKeyUp = true
            this.setState({
                highlightedIndex: index,
                isOpen: true,
                error: null
            })
        },

        ArrowUp(event) {
            event.preventDefault()
            const itemsLength = this.getFilteredItems().length
            if (!itemsLength) return
            var { highlightedIndex } = this.state
            var index = (
                highlightedIndex === 0 ||
                highlightedIndex === null
            ) ? itemsLength - 1 : highlightedIndex - 1
            this._performAutoCompleteOnKeyUp = true
            this.setState({
                highlightedIndex: index,
                isOpen: true,
                error: null
            })
        },

        Enter(event) {
            if (this.state.isOpen === false) {
                // menu is closed so there is no selection to accept -> do nothing
                return
            }
            else if (this.state.highlightedIndex == null) {
                // input has focus but no menu item is selected + enter is hit -> close the menu, highlight whatever's in input
                this.setState({
                    isOpen: false
                }, () => {
                    this.refs.input.select()
                })
            }
            else {
                // text entered + menu item has been highlighted + enter is hit -> update value to that of selected menu item, close the menu
                event.preventDefault()
                var item = this.getFilteredItems()[this.state.highlightedIndex]
                var value = this.getItemValue(item)
                this.setState({
                    isOpen: false,
                    highlightedIndex: null
                }, () => {
                    //this.refs.input.focus() // TODO: file issue
                    this.refs.input.setSelectionRange(
                        value.length,
                        value.length
                    )
                    this.setState({ value });
                    //this.props.onSelect(value, item)
                })
            }
        },

        Escape(event) {
            this.setState({
                highlightedIndex: null,
                isOpen: false
            })
        }
    },

    getFilteredItems() {
        let items = this.props.items
        //let items = this.getStates();

        items = items.filter((item) => (
            this.matchStateToTerm(item, this.state.value)
        ))

        items.sort((a, b) => (
            this.sortStates(a, b, this.state.value)
        ))

        return items
    },


    maybeAutoCompleteText() {
        if (!this.props.autoHighlight || this.state.value === '')
            return
        var { highlightedIndex } = this.state
        var items = this.getFilteredItems()
        if (items.length === 0)
            return
        var matchedItem = highlightedIndex !== null ?
            items[highlightedIndex] : items[0]
        var itemValue = this.getItemValue(matchedItem)
        var itemValueDoesMatch = (itemValue.toLowerCase().indexOf(
            this.state.value.toLowerCase()
        ) === 0)
        if (itemValueDoesMatch && highlightedIndex === null)
            this.setState({ highlightedIndex: 0 })
    },

    setMenuPositions() {
        var node = this.refs.input
        var rect = node.getBoundingClientRect()
        var computedStyle = global.window.getComputedStyle(node)
        var marginBottom = parseInt(computedStyle.marginBottom, 10) || 0;
        var marginLeft = parseInt(computedStyle.marginLeft, 10) || 0;
        var marginRight = parseInt(computedStyle.marginRight, 10) || 0;
        this.setState({
            menuTop: rect.bottom + marginBottom,
            menuLeft: rect.left + marginLeft,
            menuWidth: rect.width + marginLeft + marginRight
        })
    },

    highlightItemFromMouse(index) {
        this.setState({ highlightedIndex: index })
    },

    getItemValue(item) {
        return item[this.props.iText];
    },

    selectItemFromMouse(item) {
        var value = this.getItemValue(item);
        this.setState({
            isOpen: false,
            highlightedIndex: null
        }, () => {
            this.setState({ value });
            //this.props.onSelect(value, item)
            this.refs.input.focus()
        })
    },

    setIgnoreBlur(ignore) {
        this._ignoreBlur = ignore
    },

    renderItem(item, isHighlighted) {

        let styles = {
            item: {
                padding: '2px 6px',
                cursor: 'default'
            },

            highlightedItem: {
                color: 'white',
                background: 'hsl(200, 50%, 50%)',
                padding: '2px 6px',
                cursor: 'default'
            },

            menu: {
                border: 'solid 1px #ccc'
            }
        }

        return <div
            style={isHighlighted ? styles.highlightedItem : styles.item}
            key={item[this.props.iValue]}
            >{item[this.props.iText]}</div>
    },

    renderMenu() {
        var items = this.getFilteredItems().map((item, index) => {
            var element = this.renderItem(
                item,
                this.state.highlightedIndex === index,
                { cursor: 'default' }
            )
            return React.cloneElement(element, {
                onMouseDown: () => this.setIgnoreBlur(true), // Ignore blur to prevent menu from de-rendering before we can process click
                onMouseEnter: () => this.highlightItemFromMouse(index),
                onClick: () => this.selectItemFromMouse(item),
                ref: `item-${index}`,
            })
        })
        var style = {
            left: this.state.menuLeft,
            top: this.state.menuTop,
            minWidth: this.state.menuWidth,
        }
        var menu = this.props.renderMenu(items, this.state.value, style)
        return React.cloneElement(menu, { ref: 'menu' })
    },

    handleInputBlur(e) {
        if (this._ignoreBlur)
            return
        this.setState({
            isOpen: false,
            highlightedIndex: null
        })
        var itemList = this.getFilteredItems();
        var items = itemList[0];
        const input = e.target.value.trim();

        let value = '';
        let text = '';
        let isValid = false;

        if (input && itemList.length == 1) {
            value = items[this.props.iValue];
            text = items[this.props.iValue];
            this.setState({ value: items[this.props.iText] });
        }
        else {
            this.setState({ value: input });
        }


        const validInput = this.validInput(input, itemList.length);

        if (validInput) {
            this.setState({ error: validInput, isOpen: false });
        }
        else {
            this.setState({ error: null, isOpen: false });
            isValid = true;
        }

        this.props.formSetValue(this.props.name, value, isValid, true, text);
        this.props.resetLoading();
    },

    validInput(input, count) {
        if (!input)
            return this.props.eReq;
        else if (count != 1)
            return this.props.eInvalid;
        return null;
    },

    handleInputFocus() {
        if (this._ignoreBlur) {
            this.setIgnoreBlur(false)
            return
        }
        this._ignoreClick = true
        this.setState({
            isOpen: true,
            error: null
        })
    },

    isInputFocused() {
        var el = this.refs.input
        return el.ownerDocument && (el === el.ownerDocument.activeElement)
    },

    handleInputClick() {
        // Input will not be focused if it's disabled
        if (this.isInputFocused() && this.state.isOpen === false)
            this.setState({
                isOpen: true,
                error: null
            })
        else if (this.state.highlightedIndex !== null && !this._ignoreClick)
            this.selectItemFromMouse(this.getFilteredItems()[this.state.highlightedIndex])
        this._ignoreClick = false
    },

    composeEventHandlers(internal, external) {
        return external
            ? e => { internal(e); external(e); }
            : internal
    },

    matchStateToTerm(state, value) {
        return (
            state[this.props.iText].toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
            state[this.props.iValue].toLowerCase().indexOf(value.toLowerCase()) !== -1
        )
    },

    sortStates(a, b, value) {
        return (
            a[this.props.iText].toLowerCase().indexOf(value.toLowerCase()) >
                b[this.props.iText].toLowerCase().indexOf(value.toLowerCase()) ? 1 : -1
        )
    },

    render() {
        if (this.props.debug) {
            _debugStates.push({
                id: _debugStates.length,
                state: this.state
            })
        }

        let wrapperStyle = {
            display: 'inline-block',
            width: '100%',
            position: 'relative'
        }
        return (
            <div style={wrapperStyle}>
                <div className="autocomplete-loading-main">
                    <input
                        name={this.props.name}
                        id={this.props.id}
                        placeholder={this.props.placeholder}
                        className='form-control input-box'
                        role="combobox"
                        aria-autocomplete="list"
                        autoComplete="off"
                        ref="input"
                        onFocus={this.handleInputFocus}
                        onBlur={this.handleInputBlur}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                        onKeyUp={this.handleKeyUp}
                        onClick={this.handleInputClick}
                        value={this.state.value} />

                    <div className={'loading-zone autocomplete-loading ' + (!this.props.isLoading ? 'hidden' : '')}>
                        <div className='loading'></div>
                    </div>
                    <span className={(this.state.error != null && (this.props.isDirty || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
                    {('open' in this.props ? this.props.open : this.state.isOpen) && this.renderMenu()}
                    {
                        this.props.debug && (
                            <pre style={{ marginLeft: 300 }}>
                                {JSON.stringify(_debugStates.slice(_debugStates.length - 5, _debugStates.length), null, 2)}
                            </pre>
                        )
                    }
                </div>
            </div >
        )
    }
})

module.exports = Autocomplete


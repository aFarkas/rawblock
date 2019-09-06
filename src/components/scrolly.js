import rb, { Component } from '../core';
import { afterframePhase } from '../utils/rafqueue';

const $ = Component.$;

const docElem = rb.root;

/**
 * Adds a class `is-in-scrollrange` if component is inside of a defined viewport range. Additionally can animate child elements based on this range progress.
 *
 * @alias rb.components.scrolly
 *
 * @param element
 * @param initialDefaults
 *
 * @extends rb.components._childfx
 *
 * @example
 * <style type="sass">
 *     .rb-logos {
 *          (at)include rb-js-export((
 *              from: '-50eh',
 *              to: '100vh - 50eh',
 *              once: true,
 *              throttleDelay: 300,
 *          ));
 *
 *          .logo {
 *              opacity: 0;
 *              transition: all 400ms;
 *          }
 *
 *          &.is-in-scrollrange {
 *              .logo {
 *                  opacity: 1;
 *              }
 *          }
 *     }
 * </style>
 *
 * <div class="rb-logos js-rb-live" data-module="scrolly">
 *     <img class="logo" src="..." />
 * </div>
 *
 * @example
 * <style type="scss">
 *     .rb-logo {
 *          (at)include rb-js-export((
 *              from: "-50eh",
 *              to: "100vh - 50eh",
 *              once: true,
 *              throttleDelay: 100,
 *              childSel: 'find(.logo-item)',
 *          ));
 *
 *          .logo-item {
 *              top: 0;
 *              transition: all 50ms;
 *
 *              (at)include rb-js-export((
 *                  top: 50,
 *                  //complicated values like transform/backgroundColor...
 *                  transform: (
 *                      start: "rotate(0deg)",
 *                      value: "rotate(10deg)",
 *                  )
 *              ));
 *          }
 *     }
 * </style>
 *
 * <div class="rb-logos js-rb-live" data-module="scrolly">
 *     <img class="logo" src="..." />
 * </div>
 *
 */
class Scrolly extends (rb.components._childfx || Component) {
    /**
     * @mixes rb.components._childfx.defaults
     *
     * @prop {{}} defaults
     *
     * @prop {String} from='-100eh' Start point of in range position relative to viewport top. Can be a simple calculation (addition and subtraction) with the following units (vh = viewport height / 100, vw = viewport width / 100, eh = element height  / 100, ew = element width / 100, px). See also 'to'.
     * @prop {String} to='100vh' End point of in range position relative to viewport top. Example: '100vh' places the top of the element at the bottom of the viewport. '100vh - 20eh' Means 20% of the elements top is visible at the bottom of the viewport.
     * @prop {Boolean|String} once=false Possible values: true, false, 'entered'. Whether the component should destroy itself after it was executed once.
     * @prop {String} switchedOff=false Switches the component off.
     * @prop {Boolean} restSwitchedOff=true Whether there should be a full reset after switchedOff option change.
     * @prop {Number} throttleDelay=0 Delay in ms to check for position change. Setting this to a higher number (50-300) can improve performance.
     * @prop {String} defaults.childSel='find(.{name}-element)' Child elements that should be animated. String is processed by rb.elementFromStr.
     * @prop {String|Boolean} defaults.scrollContainer=false Defines a scrollcontainer, if different from html.
     */
    static get defaults(){
        return {
            switchedOff: false,
            from: '-100eh',
            to: '100vh',
            once: false,
            restSwitchedOff: true,
            throttleDelay: 0,
            fixedSel: 'find(.{name}{e}scrollfixed)',
            setFixedWidth: true,
            preparePadding: 0,
            scrollContainer: false,
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.minScroll = Number.MAX_VALUE;
        this.maxScroll = -1;

        this.checkTime = 4000 + (999 * Math.random());

        this.entered = false;

        this.onprogress = $.Callbacks();

        this.updateChilds = this.updateChilds || $.noop;

        rb.rAFs(this, {throttle: true}, 'changeState', 'setSwitchedOffClass', 'updateScrollFixedElement', 'changePrepareState');

        rb.rAFs(this.onprogress, 'fireWith');

        this.checkPosition = this.checkPosition.bind(this);
        this.calculateLayout = this.calculateLayout.bind(this);
        this._setupThrottleDelay(this.options.throttleDelay);

        this.reflow = rb.throttle(function () {
            if (this.checkChildReflow) {
                this.checkChildReflow();
            }
            this.calculateLayout();
        }, {that: this});

        this._setScrollinElement();
        this.parseOffsets();
        this.calculateLayout();

        if(this.options.switchedOff){
            this.setSwitchedOffClass();
        }
    }

    _setupThrottleDelay(delay) {
        if (delay && delay > 30) {
            this.throtteldCheckPosition = rb.throttle(this.checkPosition, {delay: delay});
        } else {
            this.throtteldCheckPosition = this.checkPosition;
        }
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);

        if (name == 'switchedOff' || name == 'restSwitchedOff' && this.options.switchedOff && this.options.restSwitchedOff) {
            this.changeState(false);
            this.updateChilds(true);
            this.progress = -2;
        } else if (name == 'from' || name == 'to' || (name == 'switchedOff' && !value)) {
            this.parseOffsets();
            this.calculateLayout();
        } else if (name == 'throttleDelay') {
            this.detached();
            this._setupThrottleDelay(value);
            if (rb.root.contains(this.element)) {
                this.attached();
            }
        } else if(name == 'scrollContainer'){
            this._setScrollinElement();
            this.calculateLayout();
        }

        if(name == 'switchedOff'){
            this.setSwitchedOffClass();
        }
    }

    setSwitchedOffClass(){
        this.element.classList[this.options.switchedOff ? 'add' : 'remove'](rb.statePrefix + 'switched' + rb.nameSeparator + 'off');
    }

    parseOffsets() {
        this.parsedFrom = this.parseOffset(this.options.from);
        this.parsedTo = this.parseOffset(this.options.to);
    }

    parseOffset(val) {
        let prop;

        val = ('' + val).replace(Scrolly.regWhite, '');

        let match = Scrolly.regCalc.exec(val);

        const parsedPos = {};

        while (match != null) {
            prop = Scrolly.knownUnits[match[3]] ? match[3] : 'px';
            parsedPos[prop] = parseFloat(match[2]);
            match = Scrolly.regCalc.exec(val);
        }

        return parsedPos;
    }

    addOffset(offset) {
        let prop, element, dimProp;

        let value = 0;

        for (prop in offset) {
            if (prop == 'eh' || prop == 'ev') {
                element = this.element;
            } else if (prop == 'vw' || prop == 'vh') {
                element = docElem;
            }

            if (element) {
                dimProp = prop.charAt(1) == 'w' ?
                    'clientWidth' :
                    'clientHeight'
                ;
                value += element[dimProp] / 100 * offset[prop];
            } else {
                value += offset[prop];
            }
        }
        return value;
    }
    calculateLayout() {

        if (this.options.switchedOff) {
            return;
        }
        const box = this.element.getBoundingClientRect();

        this.lastCheck = Date.now();

        if (!box.top && !box.bottom && !box.right && !box.left) {
            return;
        }

        this.boxTop = box.top + this.scrollingElement.scrollTop;
        this.boxWidth = box.width;
        this.scrollPos = this.scrollingElement.scrollTop;

        this.minScroll = this.boxTop;
        this.maxScroll = this.minScroll;

        this.minScroll -= this.addOffset(this.parsedTo);
        this.maxScroll -= this.addOffset(this.parsedFrom);

        this.minFixed = this.minScroll - 666;
        this.maxFixed = this.maxScroll + 666;

        this.minPrepareScroll = this.minScroll - this.options.preparePadding;
        this.maxPrepareScroll = this.maxScroll + this.options.preparePadding;

        this.scrollFixedElement = this.getElementsByString(this.options.fixedSel)[0];

        this.checkPosition();
    }

    checkPosition() {
        let that, wasProgress, shouldEnter, shouldEnterScrollFix, prepareEntered, progress;

        if (this.options.switchedOff) {
            return;
        }

        const pos = this.scrollingElement.scrollTop;

        this.scrollPos = pos;

        if (Date.now() - this.lastCheck > this.checkTime) {
            this.lastCheck = Date.now();
            afterframePhase(this.calculateLayout);
        }

        shouldEnterScrollFix = this.minFixed <= pos && this.maxFixed >= pos;
        prepareEntered = this.minPrepareScroll <= pos && this.maxPrepareScroll >= pos;
        shouldEnter = prepareEntered && shouldEnterScrollFix && this.minScroll <= pos && this.maxScroll >= pos;

        if (shouldEnter || (this.progress !== 0 && this.progress !== 1)) {
            progress = Math.max(Math.min((pos - this.minScroll) / (this.maxScroll - this.minScroll), 1), 0);
            wasProgress = this.progress;
            this.progress = progress;

            if (wasProgress == progress || (wasProgress == -2 && !progress)) {
                return;
            }

            this.updateChilds();
            this.onprogress.fireWith(this, [progress]);

            if (this.options.once === true && this.progress === 1) {
                that = this;
                shouldEnter = true;
                rb.rAFQueue(function () {
                    that.destroy();
                }, true);
            }
        }

        if(this.scrollFixedElement && (shouldEnterScrollFix || shouldEnterScrollFix != this.enteredFixed)){
            this.updateScrollFixedElement(shouldEnterScrollFix);
        }

        if(this.prepareEntered != prepareEntered){
            this.prepareEntered = prepareEntered;
            this.changePrepareState();
        }

        if (this.entered != shouldEnter) {
            this.changeState(shouldEnter);
        }
    }

    updateScrollFixedElement(isEntered){
        const elemStyle = this.scrollFixedElement.style;

        if(this.enteredFixed != isEntered){
            this.scrollFixedElement.classList.toggle(rb.statePrefix + 'fixed-entered', isEntered);
            if(isEntered){
                elemStyle.position = 'fixed';
            }
        }

        if(isEntered){
            elemStyle.top = this.boxTop - this.scrollPos + 'px';

            if(this.options.setFixedWidth && this.boxWidth != this.setBoxWidth){
                this.setBoxWidth = this.boxWidth;
                elemStyle.width = this.boxWidth + 'px';
            }
        } else {
            elemStyle.position = '';
            elemStyle.top = '';

            if(this.options.setFixedWidth){
                this.setBoxWidth = '';
                elemStyle.width = '';
            }
        }

        this.enteredFixed = isEntered;
    }

    changePrepareState(){
        this.element.classList.toggle(rb.statePrefix + 'scrollrange' + rb.nameSeparator + 'prepared', this.prepareEntered);
    }

    changeState(shouldEnter) {
        const once = this.options.once;

        if (this.entered != shouldEnter) {
            this.entered = shouldEnter;
            this.element.classList[shouldEnter ? 'add' : 'remove'](rb.statePrefix + 'in' + rb.nameSeparator + 'scrollrange');


            this.trigger();

            if (once == 'entered' || (once && (!this.childs || !this.childs.length))) {
                this.destroy();
            }
        }
    }

    _setScrollinElement(){
        const oldScrollingEvtElement = this.scrollingEvtElement;

        if(this.options.scrollContainer){
            this.scrollingElement = this.element.closest(this.options.scrollContainer);
        }

        if(!this.scrollingElement || !this.options.scrollContainer){
            this.scrollingElement = rb.getPageScrollingElement();
        }

        this.scrollingEvtElement = (this.scrollingElement.matches('html, body')) ?
            window :
            this.scrollingElement
        ;

        if(oldScrollingEvtElement){
            oldScrollingEvtElement.removeEventListener('scroll', this.throtteldCheckPosition);
        }

        this.scrollingEvtElement.addEventListener('scroll', this.throtteldCheckPosition);
    }

    attached() {
        this.detached();
        this._setScrollinElement();

        rb.resize.on(this.reflow);
        clearInterval(this.layoutInterval);
        this.layoutInterval = setInterval(this.reflow, Math.round(9999 + (5000 * Math.random())));
    }

    detached() {
        if(this.scrollingEvtElement){
            this.scrollingEvtElement.removeEventListener('scroll', this.throtteldCheckPosition);
        }
        rb.resize.off(this.reflow);
        clearInterval(this.layoutInterval);
    }
}

Object.assign(Scrolly, {
    regWhite: /\s/g,
    regCalc: /(([+-]*\d+[.\d]*)(px|vh|eh|vw|ew))/g,
    knownUnits: {vh: 1, eh: 1, vw: 1, ew: 1},
});

Component.register('scrolly', Scrolly);

export default Scrolly;

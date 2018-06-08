import './layoutobserve';

const rb = window.rb;
const $ = rb.$;
const scrollPositionProp = rb.Symbol('scrollPosition');

function getScrollPosition(element, forceRead){
    let scrollingElement, box;
    let positionObj = element[scrollPositionProp];

    if(!positionObj || forceRead){

        scrollingElement = rb.getPageScrollingElement();
        box = element.getBoundingClientRect();

        positionObj = {
            value: {
                scrollTop: scrollingElement.scrollTop,
                scrollLeft: scrollingElement.scrollLeft,
                top: box.top,
                left: box.left,
                bottom: box.bottom,
                right: box.right,
            },
        };
    }

    return positionObj.value;
}

function checkScrollPosition(e){
    let positions, positionObjValue;
    const element = e.target;
    let positionObj = element[scrollPositionProp];

    if(positionObj){
        positionObjValue = positionObj.value;
        positions = getScrollPosition(element, true);

        if(positions.top != positionObjValue.top ||
            positions.left != positionObjValue.left ||
            positions.bottom != positionObjValue.bottom ||
            positions.right != positionObjValue.right ||
            positions.scrollTop != positionObjValue.scrollTop ||
            positions.scrollLeft != positionObjValue.scrollLeft){
            positionObj.value = positions;
            positionObj.cbs.fireWith(element, [{target: element, value: positions, prevValue: positionObjValue}]);
        }
    }
}

rb.events.special.rb_scrollposition = {
    add: function (element, fn, _opts) {
        let positionObj = element[scrollPositionProp];

        if(!positionObj){
            positionObj = {
                cbs: $.Callbacks(),
                value: getScrollPosition(element),
            };

            element[scrollPositionProp] = positionObj;
            rb.events.add(element, 'rb_layoutchange', checkScrollPosition);
        }

        positionObj.cbs.add(fn);
    },
    remove: function (element, fn, _opts) {
        const positionObj = element[scrollPositionProp];

        if(!positionObj){
            return;
        }

        positionObj.cbs.remove(fn);

        if(!positionObj.cbs.has()){
            element[scrollPositionProp] = null;
            rb.events.remove(element, 'rb_layoutchange', checkScrollPosition);
        }
    },
};

export default getScrollPosition;

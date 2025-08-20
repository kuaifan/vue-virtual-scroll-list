/*!
 * vue-virtual-scroll-list v2.3.5-17
 * open source under the MIT license
 * https://github.com/tangbc/vue-virtual-scroll-list#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('lodash')) :
  typeof define === 'function' && define.amd ? define(['vue', 'lodash'], factory) :
  (global = global || self, global.VirtualList = factory(global.Vue, global.lodash));
}(this, (function (Vue, lodash) { 'use strict';

  Vue = Vue && Object.prototype.hasOwnProperty.call(Vue, 'default') ? Vue['default'] : Vue;

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /**
   * virtual list core calculating center
   */
  var DIRECTION_TYPE = {
    FRONT: 'FRONT',
    // scroll up or left
    BEHIND: 'BEHIND' // scroll down or right

  };
  var CALC_TYPE = {
    INIT: 'INIT',
    FIXED: 'FIXED',
    DYNAMIC: 'DYNAMIC'
  };
  var LEADING_BUFFER = 0;

  var Virtual = /*#__PURE__*/function () {
    function Virtual(param, callUpdate, callBefore) {
      _classCallCheck(this, Virtual);

      this.init(param, callUpdate, callBefore);
    }

    _createClass(Virtual, [{
      key: "init",
      value: function init(param, callUpdate, callBefore) {
        // param data
        this.param = param;
        this.callUpdate = typeof callUpdate === 'function' ? callUpdate : function () {};
        this.callBefore = typeof callBefore === 'function' ? callBefore : function () {}; // size data

        this.sizes = new Map();
        this.firstRangeTotalSize = 0;
        this.firstRangeAverageSize = 0;
        this.fixedSizeValue = 0;
        this.calcType = CALC_TYPE.INIT;
        this.temporaryEstimatedSize = 0; // scroll data

        this.offset = 0;
        this.direction = ''; // range data

        this.range = Object.create(null);

        if (param) {
          this.checkRange(0, param.keeps - 1);
        } // benchmark test data
        // this.__bsearchCalls = 0
        // this.__getIndexOffsetCalls = 0

      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.init(null, null);
      } // return current render range

    }, {
      key: "getRange",
      value: function getRange() {
        var range = Object.create(null);
        range.start = this.range.start;
        range.end = this.range.end;
        range.padFront = this.range.padFront;
        range.padBehind = this.range.padBehind;
        return range;
      }
    }, {
      key: "isBehind",
      value: function isBehind() {
        return this.direction === DIRECTION_TYPE.BEHIND;
      }
    }, {
      key: "isFront",
      value: function isFront() {
        return this.direction === DIRECTION_TYPE.FRONT;
      } // return start index offset

    }, {
      key: "getOffset",
      value: function getOffset(start) {
        return (start < 1 ? 0 : this.getIndexOffset(start)) + this.param.slotHeaderSize;
      }
    }, {
      key: "updateParam",
      value: function updateParam(key, value) {
        var _this = this;

        if (this.param && key in this.param) {
          // if uniqueIds change, find out deleted id and remove from size map
          if (key === 'uniqueIds') {
            this.sizes.forEach(function (v, key) {
              if (!value.includes(key)) {
                _this.sizes["delete"](key);
              }
            });
          }

          this.param[key] = value;
        }
      } // save each size map by id

    }, {
      key: "saveSize",
      value: function saveSize(id, size) {
        this.sizes.set(id, size); // we assume size type is fixed at the beginning and remember first size value
        // if there is no size value different from this at next comming saving
        // we think it's a fixed size list, otherwise is dynamic size list

        if (this.calcType === CALC_TYPE.INIT) {
          this.fixedSizeValue = size;
          this.calcType = CALC_TYPE.FIXED;
        } else if (this.calcType === CALC_TYPE.FIXED && this.fixedSizeValue !== size) {
          this.calcType = CALC_TYPE.DYNAMIC; // it's no use at all

          delete this.fixedSizeValue;
        } // calculate the average size only in the first range


        if (this.calcType !== CALC_TYPE.FIXED && typeof this.firstRangeTotalSize !== 'undefined') {
          if (this.sizes.size < Math.min(this.param.keeps, this.param.uniqueIds.length)) {
            this.firstRangeTotalSize = _toConsumableArray(this.sizes.values()).reduce(function (acc, val) {
              return acc + val;
            }, 0);
            this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size);
          } else {
            // it's done using
            delete this.firstRangeTotalSize;
          }
        }
      } // in some special situation (e.g. length change) we need to update in a row
      // try goiong to render next range by a leading buffer according to current direction

    }, {
      key: "handleDataSourcesChange",
      value: function handleDataSourcesChange() {
        var lastData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var start = this.range.start;

        if (this.isFront()) {
          start = start - LEADING_BUFFER;
        } else if (this.isBehind()) {
          start = start + LEADING_BUFFER;
        }

        start = Math.max(start, 0);

        if (lastData && _typeof(lastData) === 'object' && typeof lastData.estimateSize === 'number') {
          this.temporaryEstimatedSize = lastData.estimateSize;
        } else {
          this.temporaryEstimatedSize = 0;
        }

        this.updateRange(this.range.start, this.getEndByStart(start));
      } // when slot size change, we also need force update

    }, {
      key: "handleSlotSizeChange",
      value: function handleSlotSizeChange() {
        this.handleDataSourcesChange();
      } // calculating range on scroll

    }, {
      key: "handleScroll",
      value: function handleScroll(offset) {
        this.direction = offset < this.offset || offset === 0 ? DIRECTION_TYPE.FRONT : DIRECTION_TYPE.BEHIND;
        this.offset = offset;

        if (!this.param) {
          return;
        }

        if (this.direction === DIRECTION_TYPE.FRONT) {
          this.handleFront();
        } else if (this.direction === DIRECTION_TYPE.BEHIND) {
          this.handleBehind();
        }
      } // ----------- public method end -----------

    }, {
      key: "handleFront",
      value: function handleFront() {
        var overs = this.getScrollOvers(); // should not change range if start doesn't exceed overs

        if (overs > this.range.start) {
          return;
        } // move up start by a buffer length, and make sure its safety


        var start = Math.max(overs - this.param.buffer, 0);
        this.checkRange(start, this.getEndByStart(start));
      }
    }, {
      key: "handleBehind",
      value: function handleBehind() {
        var overs = this.getScrollOvers(); // range should not change if scroll overs within buffer

        if (overs < this.range.start + this.param.buffer) {
          return;
        }

        this.checkRange(overs, this.getEndByStart(overs));
      } // return the pass overs according to current scroll offset

    }, {
      key: "getScrollOvers",
      value: function getScrollOvers() {
        // if slot header exist, we need subtract its size
        var offset = this.offset - this.param.slotHeaderSize;

        if (offset <= 0) {
          return 0;
        } // if is fixed type, that can be easily


        if (this.isFixedType()) {
          return Math.floor(offset / this.fixedSizeValue);
        }

        var low = 0;
        var middle = 0;
        var middleOffset = 0;
        var high = this.param.uniqueIds.length;

        while (low <= high) {
          // this.__bsearchCalls++
          middle = low + Math.floor((high - low) / 2);
          middleOffset = this.getIndexOffset(middle);

          if (middleOffset === offset) {
            return middle;
          } else if (middleOffset < offset) {
            low = middle + 1;
          } else if (middleOffset > offset) {
            high = middle - 1;
          }
        }

        return low > 0 ? --low : 0;
      } // return a scroll offset from given index, can efficiency be improved more here?
      // although the call frequency is very high, its only a superposition of numbers

    }, {
      key: "getIndexOffset",
      value: function getIndexOffset(givenIndex) {
        if (!givenIndex) {
          return 0;
        }

        var offset = 0;
        var indexSize = 0;

        for (var index = 0; index < givenIndex; index++) {
          // this.__getIndexOffsetCalls++
          indexSize = this.sizes.get(this.param.uniqueIds[index]);
          offset = offset + (typeof indexSize === 'number' ? indexSize : this.getEstimateSize());
        }

        return offset;
      } // is fixed size type

    }, {
      key: "isFixedType",
      value: function isFixedType() {
        return this.calcType === CALC_TYPE.FIXED;
      } // return the real last index

    }, {
      key: "getLastIndex",
      value: function getLastIndex() {
        return this.param.uniqueIds.length - 1;
      } // in some conditions range is broke, we need correct it
      // and then decide whether need update to next range

    }, {
      key: "checkRange",
      value: function checkRange(start, end) {
        var keeps = this.param.keeps;
        var total = this.param.uniqueIds.length; // datas less than keeps, render all

        if (total <= keeps) {
          start = 0;
          end = this.getLastIndex();
        } else if (end - start < keeps - 1) {
          // if range length is less than keeps, corrent it base on end
          start = end - keeps + 1;
        }

        if (this.range.start !== start) {
          this.updateRange(start, end);
        }
      } // setting to a new range and rerender

    }, {
      key: "updateRange",
      value: function updateRange(start, end) {
        this.callBefore();
        this.range.start = start;
        this.range.end = end;
        this.range.padFront = this.getPadFront();
        this.range.padBehind = this.getPadBehind();
        this.callUpdate(this.getRange());
      } // return end base on start

    }, {
      key: "getEndByStart",
      value: function getEndByStart(start) {
        var theoryEnd = start + this.param.keeps - 1;
        var truelyEnd = Math.min(theoryEnd, this.getLastIndex());
        return truelyEnd;
      } // return total front offset

    }, {
      key: "getPadFront",
      value: function getPadFront() {
        if (this.isFixedType()) {
          return this.fixedSizeValue * this.range.start;
        } else {
          return this.getIndexOffset(this.range.start);
        }
      } // return total behind offset

    }, {
      key: "getPadBehind",
      value: function getPadBehind() {
        var end = this.range.end;
        var lastIndex = this.getLastIndex();
        var pad = 0; // use measured sizes when available to avoid drift; fallback to estimate for unknowns

        for (var index = end + 1; index <= lastIndex; index++) {
          var id = this.param.uniqueIds[index];
          var size = this.sizes.get(id);
          pad += typeof size === 'number' ? size : this.getEstimateSize();
        }

        return pad;
      } // get the item estimate size

    }, {
      key: "getEstimateSize",
      value: function getEstimateSize() {
        if (this.isFixedType()) {
          return this.fixedSizeValue;
        }

        if (this.temporaryEstimatedSize > 0) {
          return this.temporaryEstimatedSize;
        } // prefer the average size measured from the first rendered range if available,
        // it provides a more stable estimate than the external default


        if (typeof this.firstRangeAverageSize === 'number' && this.firstRangeAverageSize > 0) {
          return this.firstRangeAverageSize;
        }

        return this.param.estimateSize;
      }
    }]);

    return Virtual;
  }();

  /**
   * props declaration for default, item and slot component
   */
  var VirtualProps = {
    dataKey: {
      type: [String, Function],
      required: true
    },
    dataSources: {
      type: Array,
      required: true
    },
    dataComponent: {
      type: [Object, Function],
      required: true
    },
    keeps: {
      type: Number,
      "default": 30
    },
    extraProps: {
      type: Object
    },
    estimateSize: {
      type: Number,
      "default": 50
    },
    direction: {
      type: String,
      "default": 'vertical' // the other value is horizontal

    },
    start: {
      type: Number,
      "default": 0
    },
    offset: {
      type: Number,
      "default": 0
    },
    topThreshold: {
      type: Number,
      "default": 0
    },
    bottomThreshold: {
      type: Number,
      "default": 0
    },
    pageMode: {
      type: Boolean,
      "default": false
    },
    rootTag: {
      type: String,
      "default": 'div'
    },
    wrapTag: {
      type: String,
      "default": 'div'
    },
    wrapClass: {
      type: String,
      "default": ''
    },
    wrapStyle: {
      type: Object
    },
    itemTag: {
      type: String,
      "default": 'div'
    },
    itemClass: {
      type: String,
      "default": ''
    },
    itemClassAdd: {
      type: Function
    },
    itemStyle: {
      type: Object
    },
    headerTag: {
      type: String,
      "default": 'div'
    },
    headerClass: {
      type: String,
      "default": ''
    },
    headerStyle: {
      type: Object
    },
    footerTag: {
      type: String,
      "default": 'div'
    },
    footerClass: {
      type: String,
      "default": ''
    },
    footerStyle: {
      type: Object
    },
    itemScopedSlots: {
      type: Object
    },
    disabled: {
      type: Boolean,
      "default": false
    },
    activePrefix: {
      type: String,
      "default": ''
    }
  };
  var ItemProps = {
    index: {
      type: Number
    },
    event: {
      type: String
    },
    tag: {
      type: String
    },
    horizontal: {
      type: Boolean
    },
    source: {
      type: Object
    },
    component: {
      type: [Object, Function]
    },
    slotComponent: {
      type: Function
    },
    uniqueKey: {
      type: [String, Number]
    },
    extraProps: {
      type: Object
    },
    scopedSlots: {
      type: Object
    }
  };
  var SlotProps = {
    event: {
      type: String
    },
    uniqueKey: {
      type: String
    },
    tag: {
      type: String
    },
    horizontal: {
      type: Boolean
    }
  };

  var Wrapper = {
    created: function created() {
      this.shapeKey = this.horizontal ? 'offsetWidth' : 'offsetHeight';
    },
    mounted: function mounted() {
      var _this = this;

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(function () {
          _this.dispatchSizeChange();
        });
        this.resizeObserver.observe(this.$el);
      }
    },
    // since componet will be reused, so disptach when updated
    updated: function updated() {
      this.dispatchSizeChange();
    },
    beforeDestroy: function beforeDestroy() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    },
    methods: {
      getCurrentSize: function getCurrentSize() {
        return this.$el ? this.$el[this.shapeKey] : 0;
      },
      // tell parent current size identify by unqiue key
      dispatchSizeChange: function dispatchSizeChange() {
        this.$parent.$emit(this.event, this.uniqueKey, this.getCurrentSize(), this.hasInitial);
      }
    }
  }; // wrapping for item

  var Item = Vue.component('virtual-list-item', {
    mixins: [Wrapper],
    props: ItemProps,
    render: function render(h) {
      var tag = this.tag,
          component = this.component,
          _this$extraProps = this.extraProps,
          extraProps = _this$extraProps === void 0 ? {} : _this$extraProps,
          index = this.index,
          source = this.source,
          _this$scopedSlots = this.scopedSlots,
          scopedSlots = _this$scopedSlots === void 0 ? {} : _this$scopedSlots,
          uniqueKey = this.uniqueKey,
          slotComponent = this.slotComponent;

      var props = _objectSpread2({}, extraProps, {
        source: source,
        index: index
      });

      return h(tag, {
        key: uniqueKey,
        attrs: {
          role: 'listitem',
          unique: uniqueKey
        }
      }, [slotComponent ? slotComponent({
        item: source,
        index: index,
        scope: props
      }) : h(component, {
        props: props,
        scopedSlots: scopedSlots
      })]);
    }
  }); // wrapping for slot

  var Slot = Vue.component('virtual-list-slot', {
    mixins: [Wrapper],
    props: SlotProps,
    render: function render(h) {
      var tag = this.tag,
          uniqueKey = this.uniqueKey;
      return h(tag, {
        key: uniqueKey,
        attrs: {
          role: uniqueKey
        }
      }, this.$slots["default"]);
    }
  });

  /**
   * virtual list default component
   */
  var EVENT_TYPE = {
    ITEM: 'item_resize',
    SLOT: 'slot_resize'
  };
  var SLOT_TYPE = {
    HEADER: 'thead',
    // string value also use for aria role attribute
    FOOTER: 'tfoot'
  };
  var VirtualList = Vue.component('virtual-list', {
    props: VirtualProps,
    data: function data() {
      return {
        range: null,
        toBottomTimer: null,
        visibleUniques: null
      };
    },
    watch: {
      'dataSources.length': function dataSourcesLength(length) {
        this.virtual.updateParam('uniqueIds', this.getUniqueIdFromDataSources());
        this.virtual.handleDataSourcesChange(length > 0 ? this.dataSources[length - 1] : null);
      },
      estimateSize: function estimateSize(newValue) {
        this.virtual.updateParam('estimateSize', newValue);
      },
      keeps: function keeps(newValue) {
        this.virtual.updateParam('keeps', newValue);
        this.virtual.handleSlotSizeChange();
      },
      start: function start(newValue) {
        this.scrollToIndex(newValue);
      },
      offset: function offset(newValue) {
        this.scrollToOffset(newValue);
      },
      visibleUniques: function visibleUniques(value) {
        this.$emit('visible', JSON.parse(value));
      }
    },
    created: function created() {
      this.isHorizontal = this.direction === 'horizontal';
      this.directionKey = this.isHorizontal ? 'scrollLeft' : 'scrollTop';
      this.installVirtual(); // listen item size change

      this.$on(EVENT_TYPE.ITEM, this.onItemResized); // listen slot size change

      if (this.$slots.header || this.$slots.footer) {
        this.$on(EVENT_TYPE.SLOT, this.onSlotResized);
      }
    },
    activated: function activated() {
      // set back offset when awake from keep-alive
      this.scrollToOffset(this.virtual.offset);

      if (this.pageMode) {
        document.addEventListener('scroll', this.onScroll, {
          passive: false
        });
      }
    },
    deactivated: function deactivated() {
      if (this.pageMode) {
        document.removeEventListener('scroll', this.onScroll);
      }
    },
    mounted: function mounted() {
      // set position
      if (this.start) {
        this.scrollToIndex(this.start);
      } else if (this.offset) {
        this.scrollToOffset(this.offset);
      } // in page mode we bind scroll event to document


      if (this.pageMode) {
        this.updatePageModeFront();
        document.addEventListener('scroll', this.onScroll, {
          passive: false
        });
      }
    },
    beforeDestroy: function beforeDestroy() {
      this.virtual.destroy();

      if (this.pageMode) {
        document.removeEventListener('scroll', this.onScroll);
      }
    },
    methods: {
      // get item size by id
      getSize: function getSize(id) {
        return this.virtual.sizes.get(id);
      },
      // get the total number of stored (rendered) items
      getSizes: function getSizes() {
        return this.virtual.sizes.size;
      },
      // return current scroll offset
      getOffset: function getOffset() {
        if (this.pageMode) {
          return document.documentElement[this.directionKey] || document.body[this.directionKey];
        } else {
          var root = this.$refs.root;
          return root ? Math.ceil(root[this.directionKey]) : 0;
        }
      },
      // return client viewport size
      getClientSize: function getClientSize() {
        var key = this.isHorizontal ? 'clientWidth' : 'clientHeight';

        if (this.pageMode) {
          return document.documentElement[key] || document.body[key];
        } else {
          var root = this.$refs.root;
          return root ? Math.ceil(root[key]) : 0;
        }
      },
      // return all scroll size
      getScrollSize: function getScrollSize() {
        var key = this.isHorizontal ? 'scrollWidth' : 'scrollHeight';

        if (this.pageMode) {
          return document.documentElement[key] || document.body[key];
        } else {
          var root = this.$refs.root;
          return root ? Math.ceil(root[key]) : 0;
        }
      },
      // is smooth scrolling used
      scrollToBehavior: function scrollToBehavior(element, offset, smooth) {
        if (smooth) {
          var options = {
            behavior: 'smooth'
          };

          if (this.isHorizontal) {
            options.left = offset;
          } else {
            options.top = offset;
          }

          element.scrollTo(options);
        } else {
          element[this.directionKey] = offset;
        }
      },
      // set current scroll position to a expectant offset
      scrollToOffset: function scrollToOffset(offset) {
        var _this = this;

        var smooth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.$emit('activity', true);

        if (this.pageMode) {
          this.scrollToBehavior(document.body, offset, smooth);
          this.scrollToBehavior(document.documentElement, offset, smooth);
        } else {
          var root = this.$refs.root;

          if (root) {
            this.scrollToBehavior(root, offset, smooth);
          }
        }

        requestAnimationFrame(function () {
          _this.leaveAndEnter();

          _this.$emit('activity', false);
        });
      },
      // set current scroll position to a expectant index
      scrollToIndex: function scrollToIndex(index) {
        var addOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        // scroll to bottom
        if (index >= this.dataSources.length - 1) {
          this.scrollToBottom();
        } else {
          var offset = this.virtual.getOffset(index);

          if (addOffset !== 0) {
            offset = Math.max(0, offset + addOffset);
          }

          this.scrollToOffset(offset);
        }
      },
      // set current scroll position to bottom
      scrollToBottom: function scrollToBottom() {
        var _this2 = this;

        var smooth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var shepherd = this.$refs.shepherd;

        if (shepherd) {
          var offset = shepherd[this.isHorizontal ? 'offsetLeft' : 'offsetTop'];
          this.scrollToOffset(offset, smooth);

          if (smooth) {
            return;
          } // check if it's really scrolled to the bottom
          // maybe list doesn't render and calculate to last range
          // so we need retry in next event loop until it really at bottom


          if (this.toBottomTimer) {
            clearTimeout(this.toBottomTimer);
            this.toBottomTimer = null;
          }

          this.toBottomTimer = setTimeout(function () {
            if (_this2.getOffset() + _this2.getClientSize() + 1 < _this2.getScrollSize()) {
              _this2.scrollToBottom();
            }
          }, 3);
        }
      },
      stopToBottom: function stopToBottom() {
        if (this.toBottomTimer) {
          clearTimeout(this.toBottomTimer);
          this.toBottomTimer = null;
        }
      },
      scrollStop: function scrollStop() {
        this.stopToBottom();
        this.scrollToOffset(this.getOffset());
      },
      scrollInfo: function scrollInfo() {
        var clientSize = this.getClientSize();
        var offset = this.getOffset();
        var scrollSize = this.getScrollSize();
        return {
          offset: offset,
          // 滚动的距离
          scale: offset / (scrollSize - clientSize),
          // 已滚动比例
          tail: scrollSize - clientSize - offset // 与底部距离

        };
      },
      // when using page mode we need update slot header size manually
      // taking root offset relative to the browser as slot header size
      updatePageModeFront: function updatePageModeFront() {
        var root = this.$refs.root;

        if (root) {
          var rect = root.getBoundingClientRect();
          var defaultView = root.ownerDocument.defaultView;
          var offsetFront = this.isHorizontal ? rect.left + defaultView.pageXOffset : rect.top + defaultView.pageYOffset;
          this.virtual.updateParam('slotHeaderSize', offsetFront);
        }
      },
      // reset all state back to initial
      reset: function reset() {
        this.virtual.destroy();
        this.scrollToOffset(0);
        this.installVirtual();
      },
      // ----------- public method end -----------
      installVirtual: function installVirtual() {
        this.virtual = new Virtual({
          slotHeaderSize: 0,
          slotFooterSize: 0,
          keeps: this.keeps,
          estimateSize: this.estimateSize,
          buffer: Math.round(this.keeps / 3),
          // recommend for a third of keeps
          uniqueIds: this.getUniqueIdFromDataSources()
        }, this.onRangeChanged, this.onBeforeChanged); // sync initial range

        this.range = this.virtual.getRange();
        this.$emit('range', this.range);
      },
      getUniqueIdFromDataSources: function getUniqueIdFromDataSources() {
        var dataKey = this.dataKey;
        return this.dataSources.map(function (dataSource) {
          return typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey];
        });
      },
      // event called when each item mounted or size changed
      onItemResized: function onItemResized(id, size) {
        // compute delta for items before current start to correct scroll offset
        var prevSize = this.virtual.sizes.get(id);
        this.virtual.saveSize(id, size);
        var newSize = this.virtual.sizes.get(id);
        var oldVal = typeof prevSize === 'number' ? prevSize : 0;
        var newVal = typeof newSize === 'number' ? newSize : 0;
        var delta = newVal - oldVal;

        if (delta !== 0) {
          var index = this.virtual.param.uniqueIds.indexOf(id);

          if (index > -1 && index < this.range.start) {
            if (this.pageMode) {
              var current = this.getOffset();
              this.scrollToBehavior(document.body, current + delta, false);
              this.scrollToBehavior(document.documentElement, current + delta, false);
            } else if (this.$refs.root) {
              var el = this.$refs.root;
              this.scrollToBehavior(el, el[this.directionKey] + delta, false);
            }
          }
        }

        this.visibleFind();
        this.$emit('resized', id, size);
      },
      // event called when slot mounted or size changed
      onSlotResized: function onSlotResized(type, size, hasInit) {
        if (type === SLOT_TYPE.HEADER) {
          this.virtual.updateParam('slotHeaderSize', size);
        } else if (type === SLOT_TYPE.FOOTER) {
          this.virtual.updateParam('slotFooterSize', size);
        }

        if (hasInit) {
          this.virtual.handleSlotSizeChange();
        }
      },
      // here is the rerendering before
      onBeforeChanged: function onBeforeChanged() {
        this.$emit('activity', true);
      },
      // here is the rerendering entry
      onRangeChanged: function onRangeChanged(range) {
        var _this3 = this;

        this.range = range;
        this.$emit('range', this.range);
        requestAnimationFrame(function () {
          _this3.leaveAndEnter();

          _this3.$emit('activity', false);
        });
      },
      onScroll: function onScroll(evt) {
        if (this.disabled) {
          return;
        }

        var offset = this.getOffset();
        var clientSize = this.getClientSize();
        var scrollSize = this.getScrollSize(); // iOS scroll-spring-back behavior will make direction mistake

        if (offset < 0 || offset + clientSize > scrollSize + 1 || !scrollSize) {
          return;
        }

        this.virtual.handleScroll(offset);
        this.leaveAndEnter();
        this.emitEvent(offset, clientSize, scrollSize, evt);
      },
      // emit event in special position
      emitEvent: function emitEvent(offset, clientSize, scrollSize, evt) {
        this.$emit('scroll', evt, this.virtual.getRange());

        if (this.virtual.isFront() && !!this.dataSources.length && offset - this.topThreshold <= 0) {
          this.$emit('totop');
        } else if (this.virtual.isBehind() && offset + clientSize + this.bottomThreshold >= scrollSize) {
          this.$emit('tobottom');
        }
      },
      // leave or enter class
      leaveAndEnter: lodash.throttle(function () {
        var _this4 = this;

        if (!this.activePrefix || !this.$refs.root) {
          return;
        }

        var visibleUniques = [];
        var containerRect = this.$refs.root.getBoundingClientRect();
        var items = this.$refs.root.querySelectorAll('div[role="listitem"]');
        items.forEach(function (item) {
          var uniqueVal = Number(item.getAttribute('unique'));
          var itemRect = item.getBoundingClientRect();

          if (itemRect.top < containerRect.bottom && itemRect.bottom > containerRect.top && itemRect.left < containerRect.right && itemRect.right > containerRect.left) {
            item.classList.remove("".concat(_this4.activePrefix, "-leave"));
            visibleUniques.push(uniqueVal);
          } else {
            item.classList.add("".concat(_this4.activePrefix, "-leave")); // 已经完全离开
          }

          if (_this4.isHorizontal) {
            var minHalf = Math.min(100, itemRect.width / 2);
            var leftLine = itemRect.left + minHalf;
            var rightLine = itemRect.right - minHalf;

            if (rightLine < containerRect.left || leftLine > containerRect.right) {
              item.classList.remove("".concat(_this4.activePrefix, "-enter"));
            } else {
              item.classList.add("".concat(_this4.activePrefix, "-enter")); // 已经完全进入（进入一半或者大于100）
            }
          } else {
            var _minHalf = Math.min(100, itemRect.height / 2);

            var topLine = itemRect.top + _minHalf;
            var bottomLine = itemRect.bottom - _minHalf;

            if (bottomLine < containerRect.top || topLine > containerRect.bottom) {
              item.classList.remove("".concat(_this4.activePrefix, "-enter"));
            } else {
              item.classList.add("".concat(_this4.activePrefix, "-enter")); // 已经完全进入（进入一半或者大于100）
            }
          }
        });
        this.visibleUniques = JSON.stringify(visibleUniques);
      }, 16),
      // find items that are visible
      visibleFind: lodash.debounce(function () {
        if (!this.activePrefix || !this.$refs.root) {
          return;
        }

        var items = this.$refs.root.querySelectorAll("div[role=\"listitem\"]:not(.".concat(this.activePrefix, "-leave)"));
        this.visibleUniques = JSON.stringify(Array.from(items).map(function (item) {
          return Number(item.getAttribute('unique'));
        }));
      }, 50),
      // get the real render slots based on range data
      // in-place patch strategy will try to reuse components as possible
      // so those components that are reused will not trigger lifecycle mounted
      getRenderSlots: function getRenderSlots(h) {
        var slots = [];
        var _this$range = this.range,
            start = _this$range.start,
            end = _this$range.end;
        var dataSources = this.dataSources,
            dataKey = this.dataKey,
            itemClass = this.itemClass,
            itemTag = this.itemTag,
            itemStyle = this.itemStyle,
            isHorizontal = this.isHorizontal,
            extraProps = this.extraProps,
            dataComponent = this.dataComponent,
            itemScopedSlots = this.itemScopedSlots;
        var slotComponent = this.$scopedSlots && this.$scopedSlots.item;

        for (var index = start; index <= end; index++) {
          var dataSource = dataSources[index];

          if (dataSource) {
            var uniqueKey = typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey];

            if (typeof uniqueKey === 'string' || typeof uniqueKey === 'number') {
              slots.push(h(Item, {
                props: {
                  index: index,
                  tag: itemTag,
                  event: EVENT_TYPE.ITEM,
                  horizontal: isHorizontal,
                  uniqueKey: uniqueKey,
                  source: dataSource,
                  extraProps: extraProps,
                  component: dataComponent,
                  slotComponent: slotComponent,
                  scopedSlots: itemScopedSlots
                },
                style: itemStyle,
                "class": [itemClass, this.itemClassAdd ? this.itemClassAdd(index) : null]
              }));
            } else {
              console.warn("Cannot get the data-key '".concat(dataKey, "' from data-sources."));
            }
          } else {
            console.warn("Cannot get the index '".concat(index, "' from data-sources."));
          }
        }

        return slots;
      }
    },
    // render function, a closer-to-the-compiler alternative to templates
    // https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth
    render: function render(h) {
      var _this$$slots = this.$slots,
          header = _this$$slots.header,
          footer = _this$$slots.footer;
      var _this$range2 = this.range,
          padFront = _this$range2.padFront,
          padBehind = _this$range2.padBehind;
      var isHorizontal = this.isHorizontal,
          pageMode = this.pageMode,
          rootTag = this.rootTag,
          wrapTag = this.wrapTag,
          wrapClass = this.wrapClass,
          wrapStyle = this.wrapStyle,
          headerTag = this.headerTag,
          headerClass = this.headerClass,
          headerStyle = this.headerStyle,
          footerTag = this.footerTag,
          footerClass = this.footerClass,
          footerStyle = this.footerStyle,
          disabled = this.disabled;
      var paddingStyle = {
        padding: isHorizontal ? "0px ".concat(padBehind, "px 0px ").concat(padFront, "px") : "".concat(padFront, "px 0px ").concat(padBehind, "px")
      };
      var wrapperStyle = wrapStyle ? Object.assign({}, wrapStyle, paddingStyle) : paddingStyle;
      return h(rootTag, {
        ref: 'root',
        style: disabled ? {
          overflow: 'hidden'
        } : null,
        on: {
          '&scroll': !pageMode && this.onScroll
        }
      }, [// header slot
      header ? h(Slot, {
        "class": headerClass,
        style: headerStyle,
        props: {
          tag: headerTag,
          event: EVENT_TYPE.SLOT,
          uniqueKey: SLOT_TYPE.HEADER
        }
      }, header) : null, // main list
      h(wrapTag, {
        "class": wrapClass,
        attrs: {
          role: 'group'
        },
        style: wrapperStyle
      }, this.getRenderSlots(h)), // footer slot
      footer ? h(Slot, {
        "class": footerClass,
        style: footerStyle,
        props: {
          tag: footerTag,
          event: EVENT_TYPE.SLOT,
          uniqueKey: SLOT_TYPE.FOOTER
        }
      }, footer) : null, // an empty element use to scroll to bottom
      h('div', {
        ref: 'shepherd',
        style: {
          width: isHorizontal ? '0px' : '100%',
          height: isHorizontal ? '100%' : '0px'
        }
      })]);
    }
  });

  return VirtualList;

})));

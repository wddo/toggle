/**
 * <toggle>
 * 
 * @author : Jo Yun Ki (wddo@hanatour.com)
 * @version : 2.0.8
 * @since : 2015.11.09
 *
 * @classdesc
 * 
 * <strong>History</strong>
 * 
 * <pre class="prettyprint">
 * 1.2   (2015.12.10) : setNext(), setPrev(), opts.onClass 추가 
 * 1.2.1 (2015.12.11) : getOptions() 추가
 * 1.3   (2016.04.18) : opts.onlyOpen = true 기본값 고정, otps.contentSelector 추가
 * 2.0   (2016.05.16) : init()시 opts.selector 가 없어도 초기화 될수 있도록 수정
 * 2.0.1 (2017.01.25) : addIdx() 1회 최소실행 추가, setNext(), setPrev() idx 반환 수정, opts.repeat 추가
 * 2.0.2 (2017.05.16) : btnListener()에 onClass 삽입 전 상황을 전달할 콜백 함수 opts.onChangeStart 추가
 *                      opts.setCallback 삭제하고 확정성을 위해 opts.getOptions 추가, opts.onChangeParams 삭제
 * 2.0.3 (2017.08.11) : opts.mustClose 추가
 * 2.0.4 (2017.09.01) : opts.onTag 의 자신이 버튼구별 기준을 a 태그를 뿐만아니라 button 도 포함
 *                      setInstance() 적용
 * 2.0.5 (2017.09.05) : ins.getIndex() 추가
 * 2.0.6 (2017.10.23) : opts.event 옵션 추가하여 마우스 오버 컨트롤에 대한 대응
 * 2.0.7 (2018.03.19) : ins.setChange() 추가
 * 2.0.8 (2018.05.25) : opts.speed 추가 
 * </pre>
 * 
 * <strong>Initialize</strong>
 * 
 * <pre class="prettyprint">
 * var instance = new Hanatour.controls.toggle();
 * instance.init(options);
 * </pre>
 *
 * @tutorial [Demo]{@tutorial Hanatour.controls.toggle}
 * @module Hanatour/controls/toggle
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define([], factory) :
    (global.WToggle = factory());
}(this, function () {
    'use strict';
    var $ = Hanatour.jquery || jQuery;

    var wddoObj = function () {
        var scope,
            content,
            opts,
            defaults = getDefaultOption(),
            init = function (options) {
                opts = $.extend(defaults, options);
                
                if (opts.target.length > 0) {
                    if ($.fn.setInstance !== undefined) opts.target.setInstance(scope); //add 2.0.4

                    initLayout();
                    initEvent();
                }
            };

        function getDefaultOption() {
            return {
                target : $($.fn),
                selector : '',
                event : 'click.toggle',
                onTag : 'li',
                onClass : 'on',
                onlyOpen : true,
                mustClose : false,
                behavior : false,
                repeat : false,
                speed : 0,
                content : $($.fn),
                contentSelector : '',
                onChange : undefined,
                onChangeStart : undefined
            };
        }
         
        function initLayout() {

        }

        function initEvent() {
            if (opts.selector === '') {
                opts.target.on(opts.event, btnListener);    
            } else {
                opts.target.on(opts.event, opts.selector, btnListener);
            }
            
            addIdx(); //add 2.0.1

            function btnListener(e) {
                var target = $(e.currentTarget);

                addIdx();

                content = getSelector(opts.content, opts.contentSelector); //add 1.3

                //버튼의 고유 idx 를 얻어 content 갯수가 많으면 해당 content.eq(idx) 로 찾기 위함
                var idx = parseInt(target.data('toggle-idx'));

                //opts.onTag 가 'a'이거나 'button' 이면 target 이 활성화 태그이고 아니면 부모중 지정한 opts.onTag 찾아 교체
                var onTag = (opts.onTag === 'a' || opts.onTag === 'button') ? target : target.closest(opts.onTag); //modify 2.0.4 || opts.onTag === 'button'

                if (opts.onChangeStart !== undefined) opts.onChangeStart.apply(this, [{target: target, idx: idx, content: content.eq(idx)}]);
                opts.target.trigger('changestart.toggle', [{target: target, idx: idx, content: content.eq(idx)}]);

                //console.log("onTag.hasClass('on')" , onTag.hasClass('on'));
                //console.log("opts.onlyOpen" , opts.onlyOpen);
                if (onTag.hasClass(opts.onClass)) {
                    //열려있는 것 클릭 시 
                    if (opts.onlyOpen) {
                        //하나만 활성화, 닫지 않음
                        if (opts.mustClose) {
                            btnOff(idx);
                            close(idx);
                        }
                    } else {
                        //동시 활성화, 닫음 
                        btnOff(idx);
                        close(idx);
                    }
                } else {
                    //닫혀있는 것 클릭 시 
                    if (opts.onlyOpen) {
                        //하나만 활성화, 열려있는 것 모두 닫고 열기
                        btnOff();
                        close();
                        btnOn(idx);
                        open(idx);
                    } else {
                        //동시 활성화, 열려있는 것 유지
                        btnOn(idx);
                        open(idx)
                    }
                }

                if (opts.onChange !== undefined) opts.onChange.apply(this, [{target: target, idx: idx, content: content.eq(idx)}]);
                opts.target.trigger('change.toggle', [{target: target, idx: idx, content: content.eq(idx)}]);

                if (!opts.behavior) {
                    e.preventDefault();
                    e.stopPropagation();    
                }
            }
        }

        //어려 다른 형제 태그와 섞여 있어도 고유의 idx 지정
        function addIdx() {
            getSelector(opts.target, opts.selector).each(function (idx) {
                $(this).data('toggle-idx', idx);
            });
        }

        //selector 가 없으면 target 그대로 반환 
        function getSelector(target, selector) {
            return (selector !== '' && selector !== undefined) ? target.find(selector) : target;
        }

        //버튼 활성화
        function btnOn(idx) {
            var target = (idx === undefined) ? getSelector(opts.target, opts.selector) : getSelector(opts.target, opts.selector).eq(idx);
            var onTag = (opts.onTag === 'a' || opts.onTag === 'button') ? target : target.closest(opts.onTag); //modify 2.0.4

            onTag.addClass(opts.onClass);
        }

        //버튼 비활성화
        function btnOff(idx) {
            var target = (idx === undefined) ? getSelector(opts.target, opts.selector) : getSelector(opts.target, opts.selector).eq(idx);
            var onTag = (opts.onTag === 'a' || opts.onTag === 'button') ? target : target.closest(opts.onTag); //modify 2.0.4

            onTag.removeClass(opts.onClass);
        }
        
        //컨텐츠 열기
        function open(idx) {
            var target = (idx === undefined) ? getSelector(opts.content, opts.contentSelector) : getSelector(opts.content, opts.contentSelector).eq(idx);

            if (opts.speed === 0) { //add 2.0.8
                target.show();
            } else {
                target.slideDown(opts.speed); //add 2.0.8
            }
        }

        //컨텐츠 닫기
        function close(idx) {
            var target = (idx === undefined) ? getSelector(opts.content, opts.contentSelector) : getSelector(opts.content, opts.contentSelector).eq(idx);
            
            if (opts.speed === 0) { //add 2.0.8
                target.hide();
            } else {
                target.slideUp(opts.speed); //add 2.0.8
            }
        }

        //idx를 증감 한계치 안으로 반환
        function checkIdx(idx) {
            return Math.max(Math.min(idx, getSelector(opts.target, opts.selector).length - 1), 0);
        }
        
        return {
            /**
             * 초기화
             * @instance
             * 
             * @param {Object} options 옵션값
             * @property options
             * @property {jQueryObject}     options.target=$(jQuery.fn)     - 텝 메뉴 버튼 jQuery Object
             * @property {String}           options.selector=''             - on() 두번째 인자의 셀렉터
             * @property {String}           options.event='click.toggle'    - 마우스 이벤트명
             * @property {String}           options.onTag='li'              - on 클래스를 적용 할 태그 셀렉션 String
             * @property {String}           options.onClass='on'            - on 클래스 명
             * @property {Boolean}          options.onlyOpen=true           - 비 중복 활성화 유무
             * @property {Boolean}          options.mustClose=false         - onlyOpen:true에 활성화 클릭시 닫을지 유무
             * @property {jQueryObject}     options.content=$(jQuery.fn)    - 적용할 컨텐츠 jQuery Object
             * @property {String}           options.contentSelector='li'    - content 에 대한 세부 셀렉터
             * @property {Function}         options.onChange                - 텝 변경 콜백함수
             * @property {Function}         options.onChangeStart           - 텝 변경 직전 콜백함수 
             * @property {Boolean}          options.behavior=false          - 기본 비헤이비어 삭제 유무, 기본은 막음
             * @property {Boolean}          options.repeat=false            - setNext(), setPrev() 시 무한 반복 유무
             * @property {Boolean}          options.speed=0                 - 활성화&비활성화 속도
             * 
             */
            init: function (options) {
                scope = this;

                init(options);
            },

            /**
             * 모두 닫기
             * @instance
             */
            setCloseAll: function () {
                btnOff();
                close();
            },

            /**
             * 열기
             * @instance
             * @param {Number} idx 열고자하는 컨텐츠 index 넘버
             */
            setOpen: function (idx) {
                btnOn(idx);
                open(idx);
            },

            /* //del 2.0.2
            setCallback: function (change, param) {
                opts.onChange = change;
                if (param !== undefined) opts.onChangeParams = param;
            },
            */

            /**
             * 다음 메뉴 활성화
             * @instance
             */
            setNext: function () {
                var currentIdx = parseInt(getSelector(opts.target, opts.selector).filter(function () {return $(this).closest(opts.onTag).hasClass(opts.onClass);}).data('toggle-idx'));
                var nextIdx = (opts.repeat && currentIdx + 1 > getSelector(opts.target, opts.selector).length - 1) ? 0 : checkIdx(currentIdx + 1); //modify 2.0.1

                if (!isNaN(currentIdx)) getSelector(opts.target, opts.selector).eq(nextIdx).trigger('click.toggle');
            },

            /**
             * 이전 메뉴 활성화
             * @instance
             */
            setPrev: function () {
                var currentIdx = parseInt(getSelector(opts.target, opts.selector).filter(function () {return $(this).closest(opts.onTag).hasClass(opts.onClass);}).data('toggle-idx'));
                var prevIdx = (opts.repeat && currentIdx - 1 < 0) ? getSelector(opts.target, opts.selector).length - 1 : checkIdx(currentIdx - 1); //modify 2.0.1

                if (!isNaN(currentIdx)) getSelector(opts.target, opts.selector).eq(prevIdx).trigger('click.toggle');
            },

            /**
             * 해당 메뉴 활성화
             * @instance
             */
            setChange: function (idx) {
                if (idx !== undefined) getSelector(opts.target, opts.selector).eq(idx).trigger('click.toggle');
            },

            /**
             * 옵션 변경 
             * @instance
             * @param {Object} options 옵션값
             */
            setOptions: function (options) {
                $.extend(opts, options);
            },

            /**
             * 옵션 반환
             * @instance
             * @return {Object} 옵션값
             */
            getOptions: function () {
                return opts;
            },
            
            /**
             * 인덱스 반환
             * @instance
             * @return {Number} 인덱스값
             */
            getIndex: function () {
                return parseInt(getSelector(opts.target, opts.selector).filter(function () {return $(this).closest(opts.onTag).hasClass(opts.onClass);}).data('toggle-idx'));
            },

            package: this.package
        };
    };

    wddoObj.prototype.package = 'Hanatour.controls.toggle';
    
    return wddoObj;
}));

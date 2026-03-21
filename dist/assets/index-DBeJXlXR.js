(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();var Ey={exports:{}},Bl={},Ty={exports:{}},ee={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Io=Symbol.for("react.element"),BE=Symbol.for("react.portal"),$E=Symbol.for("react.fragment"),WE=Symbol.for("react.strict_mode"),qE=Symbol.for("react.profiler"),HE=Symbol.for("react.provider"),KE=Symbol.for("react.context"),GE=Symbol.for("react.forward_ref"),QE=Symbol.for("react.suspense"),YE=Symbol.for("react.memo"),XE=Symbol.for("react.lazy"),Hp=Symbol.iterator;function JE(t){return t===null||typeof t!="object"?null:(t=Hp&&t[Hp]||t["@@iterator"],typeof t=="function"?t:null)}var Iy={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Sy=Object.assign,Ay={};function Qi(t,e,n){this.props=t,this.context=e,this.refs=Ay,this.updater=n||Iy}Qi.prototype.isReactComponent={};Qi.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Qi.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Ry(){}Ry.prototype=Qi.prototype;function ih(t,e,n){this.props=t,this.context=e,this.refs=Ay,this.updater=n||Iy}var sh=ih.prototype=new Ry;sh.constructor=ih;Sy(sh,Qi.prototype);sh.isPureReactComponent=!0;var Kp=Array.isArray,ky=Object.prototype.hasOwnProperty,oh={current:null},Cy={key:!0,ref:!0,__self:!0,__source:!0};function Py(t,e,n){var r,i={},s=null,o=null;if(e!=null)for(r in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)ky.call(e,r)&&!Cy.hasOwnProperty(r)&&(i[r]=e[r]);var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){for(var u=Array(l),d=0;d<l;d++)u[d]=arguments[d+2];i.children=u}if(t&&t.defaultProps)for(r in l=t.defaultProps,l)i[r]===void 0&&(i[r]=l[r]);return{$$typeof:Io,type:t,key:s,ref:o,props:i,_owner:oh.current}}function ZE(t,e){return{$$typeof:Io,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function ah(t){return typeof t=="object"&&t!==null&&t.$$typeof===Io}function eT(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Gp=/\/+/g;function Zu(t,e){return typeof t=="object"&&t!==null&&t.key!=null?eT(""+t.key):e.toString(36)}function Na(t,e,n,r,i){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case Io:case BE:o=!0}}if(o)return o=t,i=i(o),t=r===""?"."+Zu(o,0):r,Kp(i)?(n="",t!=null&&(n=t.replace(Gp,"$&/")+"/"),Na(i,e,n,"",function(d){return d})):i!=null&&(ah(i)&&(i=ZE(i,n+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(Gp,"$&/")+"/")+t)),e.push(i)),1;if(o=0,r=r===""?".":r+":",Kp(t))for(var l=0;l<t.length;l++){s=t[l];var u=r+Zu(s,l);o+=Na(s,e,n,u,i)}else if(u=JE(t),typeof u=="function")for(t=u.call(t),l=0;!(s=t.next()).done;)s=s.value,u=r+Zu(s,l++),o+=Na(s,e,n,u,i);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function ua(t,e,n){if(t==null)return t;var r=[],i=0;return Na(t,r,"","",function(s){return e.call(n,s,i++)}),r}function tT(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var ct={current:null},Da={transition:null},nT={ReactCurrentDispatcher:ct,ReactCurrentBatchConfig:Da,ReactCurrentOwner:oh};function xy(){throw Error("act(...) is not supported in production builds of React.")}ee.Children={map:ua,forEach:function(t,e,n){ua(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return ua(t,function(){e++}),e},toArray:function(t){return ua(t,function(e){return e})||[]},only:function(t){if(!ah(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ee.Component=Qi;ee.Fragment=$E;ee.Profiler=qE;ee.PureComponent=ih;ee.StrictMode=WE;ee.Suspense=QE;ee.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=nT;ee.act=xy;ee.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var r=Sy({},t.props),i=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=oh.current),e.key!==void 0&&(i=""+e.key),t.type&&t.type.defaultProps)var l=t.type.defaultProps;for(u in e)ky.call(e,u)&&!Cy.hasOwnProperty(u)&&(r[u]=e[u]===void 0&&l!==void 0?l[u]:e[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){l=Array(u);for(var d=0;d<u;d++)l[d]=arguments[d+2];r.children=l}return{$$typeof:Io,type:t.type,key:i,ref:s,props:r,_owner:o}};ee.createContext=function(t){return t={$$typeof:KE,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:HE,_context:t},t.Consumer=t};ee.createElement=Py;ee.createFactory=function(t){var e=Py.bind(null,t);return e.type=t,e};ee.createRef=function(){return{current:null}};ee.forwardRef=function(t){return{$$typeof:GE,render:t}};ee.isValidElement=ah;ee.lazy=function(t){return{$$typeof:XE,_payload:{_status:-1,_result:t},_init:tT}};ee.memo=function(t,e){return{$$typeof:YE,type:t,compare:e===void 0?null:e}};ee.startTransition=function(t){var e=Da.transition;Da.transition={};try{t()}finally{Da.transition=e}};ee.unstable_act=xy;ee.useCallback=function(t,e){return ct.current.useCallback(t,e)};ee.useContext=function(t){return ct.current.useContext(t)};ee.useDebugValue=function(){};ee.useDeferredValue=function(t){return ct.current.useDeferredValue(t)};ee.useEffect=function(t,e){return ct.current.useEffect(t,e)};ee.useId=function(){return ct.current.useId()};ee.useImperativeHandle=function(t,e,n){return ct.current.useImperativeHandle(t,e,n)};ee.useInsertionEffect=function(t,e){return ct.current.useInsertionEffect(t,e)};ee.useLayoutEffect=function(t,e){return ct.current.useLayoutEffect(t,e)};ee.useMemo=function(t,e){return ct.current.useMemo(t,e)};ee.useReducer=function(t,e,n){return ct.current.useReducer(t,e,n)};ee.useRef=function(t){return ct.current.useRef(t)};ee.useState=function(t){return ct.current.useState(t)};ee.useSyncExternalStore=function(t,e,n){return ct.current.useSyncExternalStore(t,e,n)};ee.useTransition=function(){return ct.current.useTransition()};ee.version="18.3.1";Ty.exports=ee;var B=Ty.exports;/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var rT=B,iT=Symbol.for("react.element"),sT=Symbol.for("react.fragment"),oT=Object.prototype.hasOwnProperty,aT=rT.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,lT={key:!0,ref:!0,__self:!0,__source:!0};function by(t,e,n){var r,i={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(r in e)oT.call(e,r)&&!lT.hasOwnProperty(r)&&(i[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)i[r]===void 0&&(i[r]=e[r]);return{$$typeof:iT,type:t,key:s,ref:o,props:i,_owner:aT.current}}Bl.Fragment=sT;Bl.jsx=by;Bl.jsxs=by;Ey.exports=Bl;var p=Ey.exports,Lc={},Ny={exports:{}},St={},Dy={exports:{}},Oy={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e($,D){var K=$.length;$.push(D);e:for(;0<K;){var le=K-1>>>1,Z=$[le];if(0<i(Z,D))$[le]=D,$[K]=Z,K=le;else break e}}function n($){return $.length===0?null:$[0]}function r($){if($.length===0)return null;var D=$[0],K=$.pop();if(K!==D){$[0]=K;e:for(var le=0,Z=$.length,ue=Z>>>1;le<ue;){var Ct=2*(le+1)-1,Pt=$[Ct],ln=Ct+1,un=$[ln];if(0>i(Pt,K))ln<Z&&0>i(un,Pt)?($[le]=un,$[ln]=K,le=ln):($[le]=Pt,$[Ct]=K,le=Ct);else if(ln<Z&&0>i(un,K))$[le]=un,$[ln]=K,le=ln;else break e}}return D}function i($,D){var K=$.sortIndex-D.sortIndex;return K!==0?K:$.id-D.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var o=Date,l=o.now();t.unstable_now=function(){return o.now()-l}}var u=[],d=[],f=1,m=null,y=3,R=!1,C=!1,b=!1,L=typeof setTimeout=="function"?setTimeout:null,w=typeof clearTimeout=="function"?clearTimeout:null,E=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function S($){for(var D=n(d);D!==null;){if(D.callback===null)r(d);else if(D.startTime<=$)r(d),D.sortIndex=D.expirationTime,e(u,D);else break;D=n(d)}}function N($){if(b=!1,S($),!C)if(n(u)!==null)C=!0,Tr(V);else{var D=n(d);D!==null&&kt(N,D.startTime-$)}}function V($,D){C=!1,b&&(b=!1,w(_),_=-1),R=!0;var K=y;try{for(S(D),m=n(u);m!==null&&(!(m.expirationTime>D)||$&&!k());){var le=m.callback;if(typeof le=="function"){m.callback=null,y=m.priorityLevel;var Z=le(m.expirationTime<=D);D=t.unstable_now(),typeof Z=="function"?m.callback=Z:m===n(u)&&r(u),S(D)}else r(u);m=n(u)}if(m!==null)var ue=!0;else{var Ct=n(d);Ct!==null&&kt(N,Ct.startTime-D),ue=!1}return ue}finally{m=null,y=K,R=!1}}var j=!1,g=null,_=-1,T=5,I=-1;function k(){return!(t.unstable_now()-I<T)}function P(){if(g!==null){var $=t.unstable_now();I=$;var D=!0;try{D=g(!0,$)}finally{D?A():(j=!1,g=null)}}else j=!1}var A;if(typeof E=="function")A=function(){E(P)};else if(typeof MessageChannel<"u"){var ke=new MessageChannel,Rt=ke.port2;ke.port1.onmessage=P,A=function(){Rt.postMessage(null)}}else A=function(){L(P,0)};function Tr($){g=$,j||(j=!0,A())}function kt($,D){_=L(function(){$(t.unstable_now())},D)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function($){$.callback=null},t.unstable_continueExecution=function(){C||R||(C=!0,Tr(V))},t.unstable_forceFrameRate=function($){0>$||125<$?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):T=0<$?Math.floor(1e3/$):5},t.unstable_getCurrentPriorityLevel=function(){return y},t.unstable_getFirstCallbackNode=function(){return n(u)},t.unstable_next=function($){switch(y){case 1:case 2:case 3:var D=3;break;default:D=y}var K=y;y=D;try{return $()}finally{y=K}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function($,D){switch($){case 1:case 2:case 3:case 4:case 5:break;default:$=3}var K=y;y=$;try{return D()}finally{y=K}},t.unstable_scheduleCallback=function($,D,K){var le=t.unstable_now();switch(typeof K=="object"&&K!==null?(K=K.delay,K=typeof K=="number"&&0<K?le+K:le):K=le,$){case 1:var Z=-1;break;case 2:Z=250;break;case 5:Z=1073741823;break;case 4:Z=1e4;break;default:Z=5e3}return Z=K+Z,$={id:f++,callback:D,priorityLevel:$,startTime:K,expirationTime:Z,sortIndex:-1},K>le?($.sortIndex=K,e(d,$),n(u)===null&&$===n(d)&&(b?(w(_),_=-1):b=!0,kt(N,K-le))):($.sortIndex=Z,e(u,$),C||R||(C=!0,Tr(V))),$},t.unstable_shouldYield=k,t.unstable_wrapCallback=function($){var D=y;return function(){var K=y;y=D;try{return $.apply(this,arguments)}finally{y=K}}}})(Oy);Dy.exports=Oy;var uT=Dy.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var cT=B,It=uT;function U(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Vy=new Set,Ys={};function Qr(t,e){Di(t,e),Di(t+"Capture",e)}function Di(t,e){for(Ys[t]=e,t=0;t<e.length;t++)Vy.add(e[t])}var Tn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Mc=Object.prototype.hasOwnProperty,dT=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Qp={},Yp={};function hT(t){return Mc.call(Yp,t)?!0:Mc.call(Qp,t)?!1:dT.test(t)?Yp[t]=!0:(Qp[t]=!0,!1)}function fT(t,e,n,r){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function pT(t,e,n,r){if(e===null||typeof e>"u"||fT(t,e,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function dt(t,e,n,r,i,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var He={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){He[t]=new dt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];He[e]=new dt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){He[t]=new dt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){He[t]=new dt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){He[t]=new dt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){He[t]=new dt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){He[t]=new dt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){He[t]=new dt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){He[t]=new dt(t,5,!1,t.toLowerCase(),null,!1,!1)});var lh=/[\-:]([a-z])/g;function uh(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(lh,uh);He[e]=new dt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(lh,uh);He[e]=new dt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(lh,uh);He[e]=new dt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){He[t]=new dt(t,1,!1,t.toLowerCase(),null,!1,!1)});He.xlinkHref=new dt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){He[t]=new dt(t,1,!1,t.toLowerCase(),null,!0,!0)});function ch(t,e,n,r){var i=He.hasOwnProperty(e)?He[e]:null;(i!==null?i.type!==0:r||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(pT(e,n,i,r)&&(n=null),r||i===null?hT(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):i.mustUseProperty?t[i.propertyName]=n===null?i.type===3?!1:"":n:(e=i.attributeName,r=i.attributeNamespace,n===null?t.removeAttribute(e):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?t.setAttributeNS(r,e,n):t.setAttribute(e,n))))}var bn=cT.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ca=Symbol.for("react.element"),ci=Symbol.for("react.portal"),di=Symbol.for("react.fragment"),dh=Symbol.for("react.strict_mode"),jc=Symbol.for("react.profiler"),Ly=Symbol.for("react.provider"),My=Symbol.for("react.context"),hh=Symbol.for("react.forward_ref"),Fc=Symbol.for("react.suspense"),Uc=Symbol.for("react.suspense_list"),fh=Symbol.for("react.memo"),Fn=Symbol.for("react.lazy"),jy=Symbol.for("react.offscreen"),Xp=Symbol.iterator;function ys(t){return t===null||typeof t!="object"?null:(t=Xp&&t[Xp]||t["@@iterator"],typeof t=="function"?t:null)}var Ee=Object.assign,ec;function Rs(t){if(ec===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);ec=e&&e[1]||""}return`
`+ec+t}var tc=!1;function nc(t,e){if(!t||tc)return"";tc=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(d){var r=d}Reflect.construct(t,[],e)}else{try{e.call()}catch(d){r=d}t.call(e.prototype)}else{try{throw Error()}catch(d){r=d}t()}}catch(d){if(d&&r&&typeof d.stack=="string"){for(var i=d.stack.split(`
`),s=r.stack.split(`
`),o=i.length-1,l=s.length-1;1<=o&&0<=l&&i[o]!==s[l];)l--;for(;1<=o&&0<=l;o--,l--)if(i[o]!==s[l]){if(o!==1||l!==1)do if(o--,l--,0>l||i[o]!==s[l]){var u=`
`+i[o].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=o&&0<=l);break}}}finally{tc=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Rs(t):""}function mT(t){switch(t.tag){case 5:return Rs(t.type);case 16:return Rs("Lazy");case 13:return Rs("Suspense");case 19:return Rs("SuspenseList");case 0:case 2:case 15:return t=nc(t.type,!1),t;case 11:return t=nc(t.type.render,!1),t;case 1:return t=nc(t.type,!0),t;default:return""}}function zc(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case di:return"Fragment";case ci:return"Portal";case jc:return"Profiler";case dh:return"StrictMode";case Fc:return"Suspense";case Uc:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case My:return(t.displayName||"Context")+".Consumer";case Ly:return(t._context.displayName||"Context")+".Provider";case hh:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case fh:return e=t.displayName||null,e!==null?e:zc(t.type)||"Memo";case Fn:e=t._payload,t=t._init;try{return zc(t(e))}catch{}}return null}function gT(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return zc(e);case 8:return e===dh?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function cr(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Fy(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function yT(t){var e=Fy(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),r=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function da(t){t._valueTracker||(t._valueTracker=yT(t))}function Uy(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=Fy(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function el(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function Bc(t,e){var n=e.checked;return Ee({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function Jp(t,e){var n=e.defaultValue==null?"":e.defaultValue,r=e.checked!=null?e.checked:e.defaultChecked;n=cr(e.value!=null?e.value:n),t._wrapperState={initialChecked:r,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function zy(t,e){e=e.checked,e!=null&&ch(t,"checked",e,!1)}function $c(t,e){zy(t,e);var n=cr(e.value),r=e.type;if(n!=null)r==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(r==="submit"||r==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?Wc(t,e.type,n):e.hasOwnProperty("defaultValue")&&Wc(t,e.type,cr(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function Zp(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var r=e.type;if(!(r!=="submit"&&r!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function Wc(t,e,n){(e!=="number"||el(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var ks=Array.isArray;function Ii(t,e,n,r){if(t=t.options,e){e={};for(var i=0;i<n.length;i++)e["$"+n[i]]=!0;for(n=0;n<t.length;n++)i=e.hasOwnProperty("$"+t[n].value),t[n].selected!==i&&(t[n].selected=i),i&&r&&(t[n].defaultSelected=!0)}else{for(n=""+cr(n),e=null,i=0;i<t.length;i++){if(t[i].value===n){t[i].selected=!0,r&&(t[i].defaultSelected=!0);return}e!==null||t[i].disabled||(e=t[i])}e!==null&&(e.selected=!0)}}function qc(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(U(91));return Ee({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function em(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(U(92));if(ks(n)){if(1<n.length)throw Error(U(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:cr(n)}}function By(t,e){var n=cr(e.value),r=cr(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),r!=null&&(t.defaultValue=""+r)}function tm(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function $y(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Hc(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?$y(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var ha,Wy=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,r,i){MSApp.execUnsafeLocalFunction(function(){return t(e,n,r,i)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(ha=ha||document.createElement("div"),ha.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=ha.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function Xs(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Ls={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},vT=["Webkit","ms","Moz","O"];Object.keys(Ls).forEach(function(t){vT.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),Ls[e]=Ls[t]})});function qy(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||Ls.hasOwnProperty(t)&&Ls[t]?(""+e).trim():e+"px"}function Hy(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=qy(n,e[n],r);n==="float"&&(n="cssFloat"),r?t.setProperty(n,i):t[n]=i}}var _T=Ee({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Kc(t,e){if(e){if(_T[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(U(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(U(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(U(61))}if(e.style!=null&&typeof e.style!="object")throw Error(U(62))}}function Gc(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Qc=null;function ph(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Yc=null,Si=null,Ai=null;function nm(t){if(t=Ro(t)){if(typeof Yc!="function")throw Error(U(280));var e=t.stateNode;e&&(e=Kl(e),Yc(t.stateNode,t.type,e))}}function Ky(t){Si?Ai?Ai.push(t):Ai=[t]:Si=t}function Gy(){if(Si){var t=Si,e=Ai;if(Ai=Si=null,nm(t),e)for(t=0;t<e.length;t++)nm(e[t])}}function Qy(t,e){return t(e)}function Yy(){}var rc=!1;function Xy(t,e,n){if(rc)return t(e,n);rc=!0;try{return Qy(t,e,n)}finally{rc=!1,(Si!==null||Ai!==null)&&(Yy(),Gy())}}function Js(t,e){var n=t.stateNode;if(n===null)return null;var r=Kl(n);if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(U(231,e,typeof n));return n}var Xc=!1;if(Tn)try{var vs={};Object.defineProperty(vs,"passive",{get:function(){Xc=!0}}),window.addEventListener("test",vs,vs),window.removeEventListener("test",vs,vs)}catch{Xc=!1}function wT(t,e,n,r,i,s,o,l,u){var d=Array.prototype.slice.call(arguments,3);try{e.apply(n,d)}catch(f){this.onError(f)}}var Ms=!1,tl=null,nl=!1,Jc=null,ET={onError:function(t){Ms=!0,tl=t}};function TT(t,e,n,r,i,s,o,l,u){Ms=!1,tl=null,wT.apply(ET,arguments)}function IT(t,e,n,r,i,s,o,l,u){if(TT.apply(this,arguments),Ms){if(Ms){var d=tl;Ms=!1,tl=null}else throw Error(U(198));nl||(nl=!0,Jc=d)}}function Yr(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Jy(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function rm(t){if(Yr(t)!==t)throw Error(U(188))}function ST(t){var e=t.alternate;if(!e){if(e=Yr(t),e===null)throw Error(U(188));return e!==t?null:t}for(var n=t,r=e;;){var i=n.return;if(i===null)break;var s=i.alternate;if(s===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===s.child){for(s=i.child;s;){if(s===n)return rm(i),t;if(s===r)return rm(i),e;s=s.sibling}throw Error(U(188))}if(n.return!==r.return)n=i,r=s;else{for(var o=!1,l=i.child;l;){if(l===n){o=!0,n=i,r=s;break}if(l===r){o=!0,r=i,n=s;break}l=l.sibling}if(!o){for(l=s.child;l;){if(l===n){o=!0,n=s,r=i;break}if(l===r){o=!0,r=s,n=i;break}l=l.sibling}if(!o)throw Error(U(189))}}if(n.alternate!==r)throw Error(U(190))}if(n.tag!==3)throw Error(U(188));return n.stateNode.current===n?t:e}function Zy(t){return t=ST(t),t!==null?ev(t):null}function ev(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=ev(t);if(e!==null)return e;t=t.sibling}return null}var tv=It.unstable_scheduleCallback,im=It.unstable_cancelCallback,AT=It.unstable_shouldYield,RT=It.unstable_requestPaint,Re=It.unstable_now,kT=It.unstable_getCurrentPriorityLevel,mh=It.unstable_ImmediatePriority,nv=It.unstable_UserBlockingPriority,rl=It.unstable_NormalPriority,CT=It.unstable_LowPriority,rv=It.unstable_IdlePriority,$l=null,en=null;function PT(t){if(en&&typeof en.onCommitFiberRoot=="function")try{en.onCommitFiberRoot($l,t,void 0,(t.current.flags&128)===128)}catch{}}var Wt=Math.clz32?Math.clz32:NT,xT=Math.log,bT=Math.LN2;function NT(t){return t>>>=0,t===0?32:31-(xT(t)/bT|0)|0}var fa=64,pa=4194304;function Cs(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function il(t,e){var n=t.pendingLanes;if(n===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var l=o&~i;l!==0?r=Cs(l):(s&=o,s!==0&&(r=Cs(s)))}else o=n&~i,o!==0?r=Cs(o):s!==0&&(r=Cs(s));if(r===0)return 0;if(e!==0&&e!==r&&!(e&i)&&(i=r&-r,s=e&-e,i>=s||i===16&&(s&4194240)!==0))return e;if(r&4&&(r|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=r;0<e;)n=31-Wt(e),i=1<<n,r|=t[n],e&=~i;return r}function DT(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function OT(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,i=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-Wt(s),l=1<<o,u=i[o];u===-1?(!(l&n)||l&r)&&(i[o]=DT(l,e)):u<=e&&(t.expiredLanes|=l),s&=~l}}function Zc(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function iv(){var t=fa;return fa<<=1,!(fa&4194240)&&(fa=64),t}function ic(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function So(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-Wt(e),t[e]=n}function VT(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var r=t.eventTimes;for(t=t.expirationTimes;0<n;){var i=31-Wt(n),s=1<<i;e[i]=0,r[i]=-1,t[i]=-1,n&=~s}}function gh(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-Wt(n),i=1<<r;i&e|t[r]&e&&(t[r]|=e),n&=~i}}var ce=0;function sv(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var ov,yh,av,lv,uv,ed=!1,ma=[],Xn=null,Jn=null,Zn=null,Zs=new Map,eo=new Map,zn=[],LT="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function sm(t,e){switch(t){case"focusin":case"focusout":Xn=null;break;case"dragenter":case"dragleave":Jn=null;break;case"mouseover":case"mouseout":Zn=null;break;case"pointerover":case"pointerout":Zs.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":eo.delete(e.pointerId)}}function _s(t,e,n,r,i,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:s,targetContainers:[i]},e!==null&&(e=Ro(e),e!==null&&yh(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,i!==null&&e.indexOf(i)===-1&&e.push(i),t)}function MT(t,e,n,r,i){switch(e){case"focusin":return Xn=_s(Xn,t,e,n,r,i),!0;case"dragenter":return Jn=_s(Jn,t,e,n,r,i),!0;case"mouseover":return Zn=_s(Zn,t,e,n,r,i),!0;case"pointerover":var s=i.pointerId;return Zs.set(s,_s(Zs.get(s)||null,t,e,n,r,i)),!0;case"gotpointercapture":return s=i.pointerId,eo.set(s,_s(eo.get(s)||null,t,e,n,r,i)),!0}return!1}function cv(t){var e=xr(t.target);if(e!==null){var n=Yr(e);if(n!==null){if(e=n.tag,e===13){if(e=Jy(n),e!==null){t.blockedOn=e,uv(t.priority,function(){av(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Oa(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=td(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);Qc=r,n.target.dispatchEvent(r),Qc=null}else return e=Ro(n),e!==null&&yh(e),t.blockedOn=n,!1;e.shift()}return!0}function om(t,e,n){Oa(t)&&n.delete(e)}function jT(){ed=!1,Xn!==null&&Oa(Xn)&&(Xn=null),Jn!==null&&Oa(Jn)&&(Jn=null),Zn!==null&&Oa(Zn)&&(Zn=null),Zs.forEach(om),eo.forEach(om)}function ws(t,e){t.blockedOn===e&&(t.blockedOn=null,ed||(ed=!0,It.unstable_scheduleCallback(It.unstable_NormalPriority,jT)))}function to(t){function e(i){return ws(i,t)}if(0<ma.length){ws(ma[0],t);for(var n=1;n<ma.length;n++){var r=ma[n];r.blockedOn===t&&(r.blockedOn=null)}}for(Xn!==null&&ws(Xn,t),Jn!==null&&ws(Jn,t),Zn!==null&&ws(Zn,t),Zs.forEach(e),eo.forEach(e),n=0;n<zn.length;n++)r=zn[n],r.blockedOn===t&&(r.blockedOn=null);for(;0<zn.length&&(n=zn[0],n.blockedOn===null);)cv(n),n.blockedOn===null&&zn.shift()}var Ri=bn.ReactCurrentBatchConfig,sl=!0;function FT(t,e,n,r){var i=ce,s=Ri.transition;Ri.transition=null;try{ce=1,vh(t,e,n,r)}finally{ce=i,Ri.transition=s}}function UT(t,e,n,r){var i=ce,s=Ri.transition;Ri.transition=null;try{ce=4,vh(t,e,n,r)}finally{ce=i,Ri.transition=s}}function vh(t,e,n,r){if(sl){var i=td(t,e,n,r);if(i===null)pc(t,e,r,ol,n),sm(t,r);else if(MT(i,t,e,n,r))r.stopPropagation();else if(sm(t,r),e&4&&-1<LT.indexOf(t)){for(;i!==null;){var s=Ro(i);if(s!==null&&ov(s),s=td(t,e,n,r),s===null&&pc(t,e,r,ol,n),s===i)break;i=s}i!==null&&r.stopPropagation()}else pc(t,e,r,null,n)}}var ol=null;function td(t,e,n,r){if(ol=null,t=ph(r),t=xr(t),t!==null)if(e=Yr(t),e===null)t=null;else if(n=e.tag,n===13){if(t=Jy(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return ol=t,null}function dv(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(kT()){case mh:return 1;case nv:return 4;case rl:case CT:return 16;case rv:return 536870912;default:return 16}default:return 16}}var Gn=null,_h=null,Va=null;function hv(){if(Va)return Va;var t,e=_h,n=e.length,r,i="value"in Gn?Gn.value:Gn.textContent,s=i.length;for(t=0;t<n&&e[t]===i[t];t++);var o=n-t;for(r=1;r<=o&&e[n-r]===i[s-r];r++);return Va=i.slice(t,1<r?1-r:void 0)}function La(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function ga(){return!0}function am(){return!1}function At(t){function e(n,r,i,s,o){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?ga:am,this.isPropagationStopped=am,this}return Ee(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=ga)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=ga)},persist:function(){},isPersistent:ga}),e}var Yi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},wh=At(Yi),Ao=Ee({},Yi,{view:0,detail:0}),zT=At(Ao),sc,oc,Es,Wl=Ee({},Ao,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Eh,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Es&&(Es&&t.type==="mousemove"?(sc=t.screenX-Es.screenX,oc=t.screenY-Es.screenY):oc=sc=0,Es=t),sc)},movementY:function(t){return"movementY"in t?t.movementY:oc}}),lm=At(Wl),BT=Ee({},Wl,{dataTransfer:0}),$T=At(BT),WT=Ee({},Ao,{relatedTarget:0}),ac=At(WT),qT=Ee({},Yi,{animationName:0,elapsedTime:0,pseudoElement:0}),HT=At(qT),KT=Ee({},Yi,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),GT=At(KT),QT=Ee({},Yi,{data:0}),um=At(QT),YT={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},XT={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},JT={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function ZT(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=JT[t])?!!e[t]:!1}function Eh(){return ZT}var eI=Ee({},Ao,{key:function(t){if(t.key){var e=YT[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=La(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?XT[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Eh,charCode:function(t){return t.type==="keypress"?La(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?La(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),tI=At(eI),nI=Ee({},Wl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),cm=At(nI),rI=Ee({},Ao,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Eh}),iI=At(rI),sI=Ee({},Yi,{propertyName:0,elapsedTime:0,pseudoElement:0}),oI=At(sI),aI=Ee({},Wl,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),lI=At(aI),uI=[9,13,27,32],Th=Tn&&"CompositionEvent"in window,js=null;Tn&&"documentMode"in document&&(js=document.documentMode);var cI=Tn&&"TextEvent"in window&&!js,fv=Tn&&(!Th||js&&8<js&&11>=js),dm=" ",hm=!1;function pv(t,e){switch(t){case"keyup":return uI.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function mv(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var hi=!1;function dI(t,e){switch(t){case"compositionend":return mv(e);case"keypress":return e.which!==32?null:(hm=!0,dm);case"textInput":return t=e.data,t===dm&&hm?null:t;default:return null}}function hI(t,e){if(hi)return t==="compositionend"||!Th&&pv(t,e)?(t=hv(),Va=_h=Gn=null,hi=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return fv&&e.locale!=="ko"?null:e.data;default:return null}}var fI={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function fm(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!fI[t.type]:e==="textarea"}function gv(t,e,n,r){Ky(r),e=al(e,"onChange"),0<e.length&&(n=new wh("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var Fs=null,no=null;function pI(t){kv(t,0)}function ql(t){var e=mi(t);if(Uy(e))return t}function mI(t,e){if(t==="change")return e}var yv=!1;if(Tn){var lc;if(Tn){var uc="oninput"in document;if(!uc){var pm=document.createElement("div");pm.setAttribute("oninput","return;"),uc=typeof pm.oninput=="function"}lc=uc}else lc=!1;yv=lc&&(!document.documentMode||9<document.documentMode)}function mm(){Fs&&(Fs.detachEvent("onpropertychange",vv),no=Fs=null)}function vv(t){if(t.propertyName==="value"&&ql(no)){var e=[];gv(e,no,t,ph(t)),Xy(pI,e)}}function gI(t,e,n){t==="focusin"?(mm(),Fs=e,no=n,Fs.attachEvent("onpropertychange",vv)):t==="focusout"&&mm()}function yI(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return ql(no)}function vI(t,e){if(t==="click")return ql(e)}function _I(t,e){if(t==="input"||t==="change")return ql(e)}function wI(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Ht=typeof Object.is=="function"?Object.is:wI;function ro(t,e){if(Ht(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!Mc.call(e,i)||!Ht(t[i],e[i]))return!1}return!0}function gm(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function ym(t,e){var n=gm(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=gm(n)}}function _v(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?_v(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function wv(){for(var t=window,e=el();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=el(t.document)}return e}function Ih(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function EI(t){var e=wv(),n=t.focusedElem,r=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&_v(n.ownerDocument.documentElement,n)){if(r!==null&&Ih(n)){if(e=r.start,t=r.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var i=n.textContent.length,s=Math.min(r.start,i);r=r.end===void 0?s:Math.min(r.end,i),!t.extend&&s>r&&(i=r,r=s,s=i),i=ym(n,s);var o=ym(n,r);i&&o&&(t.rangeCount!==1||t.anchorNode!==i.node||t.anchorOffset!==i.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(i.node,i.offset),t.removeAllRanges(),s>r?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var TI=Tn&&"documentMode"in document&&11>=document.documentMode,fi=null,nd=null,Us=null,rd=!1;function vm(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;rd||fi==null||fi!==el(r)||(r=fi,"selectionStart"in r&&Ih(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Us&&ro(Us,r)||(Us=r,r=al(nd,"onSelect"),0<r.length&&(e=new wh("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=fi)))}function ya(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var pi={animationend:ya("Animation","AnimationEnd"),animationiteration:ya("Animation","AnimationIteration"),animationstart:ya("Animation","AnimationStart"),transitionend:ya("Transition","TransitionEnd")},cc={},Ev={};Tn&&(Ev=document.createElement("div").style,"AnimationEvent"in window||(delete pi.animationend.animation,delete pi.animationiteration.animation,delete pi.animationstart.animation),"TransitionEvent"in window||delete pi.transitionend.transition);function Hl(t){if(cc[t])return cc[t];if(!pi[t])return t;var e=pi[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Ev)return cc[t]=e[n];return t}var Tv=Hl("animationend"),Iv=Hl("animationiteration"),Sv=Hl("animationstart"),Av=Hl("transitionend"),Rv=new Map,_m="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function gr(t,e){Rv.set(t,e),Qr(e,[t])}for(var dc=0;dc<_m.length;dc++){var hc=_m[dc],II=hc.toLowerCase(),SI=hc[0].toUpperCase()+hc.slice(1);gr(II,"on"+SI)}gr(Tv,"onAnimationEnd");gr(Iv,"onAnimationIteration");gr(Sv,"onAnimationStart");gr("dblclick","onDoubleClick");gr("focusin","onFocus");gr("focusout","onBlur");gr(Av,"onTransitionEnd");Di("onMouseEnter",["mouseout","mouseover"]);Di("onMouseLeave",["mouseout","mouseover"]);Di("onPointerEnter",["pointerout","pointerover"]);Di("onPointerLeave",["pointerout","pointerover"]);Qr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Qr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Qr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Qr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Qr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Qr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ps="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),AI=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ps));function wm(t,e,n){var r=t.type||"unknown-event";t.currentTarget=n,IT(r,e,void 0,t),t.currentTarget=null}function kv(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],i=r.event;r=r.listeners;e:{var s=void 0;if(e)for(var o=r.length-1;0<=o;o--){var l=r[o],u=l.instance,d=l.currentTarget;if(l=l.listener,u!==s&&i.isPropagationStopped())break e;wm(i,l,d),s=u}else for(o=0;o<r.length;o++){if(l=r[o],u=l.instance,d=l.currentTarget,l=l.listener,u!==s&&i.isPropagationStopped())break e;wm(i,l,d),s=u}}}if(nl)throw t=Jc,nl=!1,Jc=null,t}function me(t,e){var n=e[ld];n===void 0&&(n=e[ld]=new Set);var r=t+"__bubble";n.has(r)||(Cv(e,t,2,!1),n.add(r))}function fc(t,e,n){var r=0;e&&(r|=4),Cv(n,t,r,e)}var va="_reactListening"+Math.random().toString(36).slice(2);function io(t){if(!t[va]){t[va]=!0,Vy.forEach(function(n){n!=="selectionchange"&&(AI.has(n)||fc(n,!1,t),fc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[va]||(e[va]=!0,fc("selectionchange",!1,e))}}function Cv(t,e,n,r){switch(dv(e)){case 1:var i=FT;break;case 4:i=UT;break;default:i=vh}n=i.bind(null,e,n,t),i=void 0,!Xc||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(i=!0),r?i!==void 0?t.addEventListener(e,n,{capture:!0,passive:i}):t.addEventListener(e,n,!0):i!==void 0?t.addEventListener(e,n,{passive:i}):t.addEventListener(e,n,!1)}function pc(t,e,n,r,i){var s=r;if(!(e&1)&&!(e&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var l=r.stateNode.containerInfo;if(l===i||l.nodeType===8&&l.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var u=o.tag;if((u===3||u===4)&&(u=o.stateNode.containerInfo,u===i||u.nodeType===8&&u.parentNode===i))return;o=o.return}for(;l!==null;){if(o=xr(l),o===null)return;if(u=o.tag,u===5||u===6){r=s=o;continue e}l=l.parentNode}}r=r.return}Xy(function(){var d=s,f=ph(n),m=[];e:{var y=Rv.get(t);if(y!==void 0){var R=wh,C=t;switch(t){case"keypress":if(La(n)===0)break e;case"keydown":case"keyup":R=tI;break;case"focusin":C="focus",R=ac;break;case"focusout":C="blur",R=ac;break;case"beforeblur":case"afterblur":R=ac;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":R=lm;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":R=$T;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":R=iI;break;case Tv:case Iv:case Sv:R=HT;break;case Av:R=oI;break;case"scroll":R=zT;break;case"wheel":R=lI;break;case"copy":case"cut":case"paste":R=GT;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":R=cm}var b=(e&4)!==0,L=!b&&t==="scroll",w=b?y!==null?y+"Capture":null:y;b=[];for(var E=d,S;E!==null;){S=E;var N=S.stateNode;if(S.tag===5&&N!==null&&(S=N,w!==null&&(N=Js(E,w),N!=null&&b.push(so(E,N,S)))),L)break;E=E.return}0<b.length&&(y=new R(y,C,null,n,f),m.push({event:y,listeners:b}))}}if(!(e&7)){e:{if(y=t==="mouseover"||t==="pointerover",R=t==="mouseout"||t==="pointerout",y&&n!==Qc&&(C=n.relatedTarget||n.fromElement)&&(xr(C)||C[In]))break e;if((R||y)&&(y=f.window===f?f:(y=f.ownerDocument)?y.defaultView||y.parentWindow:window,R?(C=n.relatedTarget||n.toElement,R=d,C=C?xr(C):null,C!==null&&(L=Yr(C),C!==L||C.tag!==5&&C.tag!==6)&&(C=null)):(R=null,C=d),R!==C)){if(b=lm,N="onMouseLeave",w="onMouseEnter",E="mouse",(t==="pointerout"||t==="pointerover")&&(b=cm,N="onPointerLeave",w="onPointerEnter",E="pointer"),L=R==null?y:mi(R),S=C==null?y:mi(C),y=new b(N,E+"leave",R,n,f),y.target=L,y.relatedTarget=S,N=null,xr(f)===d&&(b=new b(w,E+"enter",C,n,f),b.target=S,b.relatedTarget=L,N=b),L=N,R&&C)t:{for(b=R,w=C,E=0,S=b;S;S=si(S))E++;for(S=0,N=w;N;N=si(N))S++;for(;0<E-S;)b=si(b),E--;for(;0<S-E;)w=si(w),S--;for(;E--;){if(b===w||w!==null&&b===w.alternate)break t;b=si(b),w=si(w)}b=null}else b=null;R!==null&&Em(m,y,R,b,!1),C!==null&&L!==null&&Em(m,L,C,b,!0)}}e:{if(y=d?mi(d):window,R=y.nodeName&&y.nodeName.toLowerCase(),R==="select"||R==="input"&&y.type==="file")var V=mI;else if(fm(y))if(yv)V=_I;else{V=yI;var j=gI}else(R=y.nodeName)&&R.toLowerCase()==="input"&&(y.type==="checkbox"||y.type==="radio")&&(V=vI);if(V&&(V=V(t,d))){gv(m,V,n,f);break e}j&&j(t,y,d),t==="focusout"&&(j=y._wrapperState)&&j.controlled&&y.type==="number"&&Wc(y,"number",y.value)}switch(j=d?mi(d):window,t){case"focusin":(fm(j)||j.contentEditable==="true")&&(fi=j,nd=d,Us=null);break;case"focusout":Us=nd=fi=null;break;case"mousedown":rd=!0;break;case"contextmenu":case"mouseup":case"dragend":rd=!1,vm(m,n,f);break;case"selectionchange":if(TI)break;case"keydown":case"keyup":vm(m,n,f)}var g;if(Th)e:{switch(t){case"compositionstart":var _="onCompositionStart";break e;case"compositionend":_="onCompositionEnd";break e;case"compositionupdate":_="onCompositionUpdate";break e}_=void 0}else hi?pv(t,n)&&(_="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(_="onCompositionStart");_&&(fv&&n.locale!=="ko"&&(hi||_!=="onCompositionStart"?_==="onCompositionEnd"&&hi&&(g=hv()):(Gn=f,_h="value"in Gn?Gn.value:Gn.textContent,hi=!0)),j=al(d,_),0<j.length&&(_=new um(_,t,null,n,f),m.push({event:_,listeners:j}),g?_.data=g:(g=mv(n),g!==null&&(_.data=g)))),(g=cI?dI(t,n):hI(t,n))&&(d=al(d,"onBeforeInput"),0<d.length&&(f=new um("onBeforeInput","beforeinput",null,n,f),m.push({event:f,listeners:d}),f.data=g))}kv(m,e)})}function so(t,e,n){return{instance:t,listener:e,currentTarget:n}}function al(t,e){for(var n=e+"Capture",r=[];t!==null;){var i=t,s=i.stateNode;i.tag===5&&s!==null&&(i=s,s=Js(t,n),s!=null&&r.unshift(so(t,s,i)),s=Js(t,e),s!=null&&r.push(so(t,s,i))),t=t.return}return r}function si(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Em(t,e,n,r,i){for(var s=e._reactName,o=[];n!==null&&n!==r;){var l=n,u=l.alternate,d=l.stateNode;if(u!==null&&u===r)break;l.tag===5&&d!==null&&(l=d,i?(u=Js(n,s),u!=null&&o.unshift(so(n,u,l))):i||(u=Js(n,s),u!=null&&o.push(so(n,u,l)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var RI=/\r\n?/g,kI=/\u0000|\uFFFD/g;function Tm(t){return(typeof t=="string"?t:""+t).replace(RI,`
`).replace(kI,"")}function _a(t,e,n){if(e=Tm(e),Tm(t)!==e&&n)throw Error(U(425))}function ll(){}var id=null,sd=null;function od(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var ad=typeof setTimeout=="function"?setTimeout:void 0,CI=typeof clearTimeout=="function"?clearTimeout:void 0,Im=typeof Promise=="function"?Promise:void 0,PI=typeof queueMicrotask=="function"?queueMicrotask:typeof Im<"u"?function(t){return Im.resolve(null).then(t).catch(xI)}:ad;function xI(t){setTimeout(function(){throw t})}function mc(t,e){var n=e,r=0;do{var i=n.nextSibling;if(t.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){t.removeChild(i),to(e);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);to(e)}function er(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function Sm(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Xi=Math.random().toString(36).slice(2),Xt="__reactFiber$"+Xi,oo="__reactProps$"+Xi,In="__reactContainer$"+Xi,ld="__reactEvents$"+Xi,bI="__reactListeners$"+Xi,NI="__reactHandles$"+Xi;function xr(t){var e=t[Xt];if(e)return e;for(var n=t.parentNode;n;){if(e=n[In]||n[Xt]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Sm(t);t!==null;){if(n=t[Xt])return n;t=Sm(t)}return e}t=n,n=t.parentNode}return null}function Ro(t){return t=t[Xt]||t[In],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function mi(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(U(33))}function Kl(t){return t[oo]||null}var ud=[],gi=-1;function yr(t){return{current:t}}function ye(t){0>gi||(t.current=ud[gi],ud[gi]=null,gi--)}function fe(t,e){gi++,ud[gi]=t.current,t.current=e}var dr={},it=yr(dr),mt=yr(!1),Mr=dr;function Oi(t,e){var n=t.type.contextTypes;if(!n)return dr;var r=t.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===e)return r.__reactInternalMemoizedMaskedChildContext;var i={},s;for(s in n)i[s]=e[s];return r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=i),i}function gt(t){return t=t.childContextTypes,t!=null}function ul(){ye(mt),ye(it)}function Am(t,e,n){if(it.current!==dr)throw Error(U(168));fe(it,e),fe(mt,n)}function Pv(t,e,n){var r=t.stateNode;if(e=e.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in e))throw Error(U(108,gT(t)||"Unknown",i));return Ee({},n,r)}function cl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||dr,Mr=it.current,fe(it,t),fe(mt,mt.current),!0}function Rm(t,e,n){var r=t.stateNode;if(!r)throw Error(U(169));n?(t=Pv(t,e,Mr),r.__reactInternalMemoizedMergedChildContext=t,ye(mt),ye(it),fe(it,t)):ye(mt),fe(mt,n)}var pn=null,Gl=!1,gc=!1;function xv(t){pn===null?pn=[t]:pn.push(t)}function DI(t){Gl=!0,xv(t)}function vr(){if(!gc&&pn!==null){gc=!0;var t=0,e=ce;try{var n=pn;for(ce=1;t<n.length;t++){var r=n[t];do r=r(!0);while(r!==null)}pn=null,Gl=!1}catch(i){throw pn!==null&&(pn=pn.slice(t+1)),tv(mh,vr),i}finally{ce=e,gc=!1}}return null}var yi=[],vi=0,dl=null,hl=0,xt=[],bt=0,jr=null,mn=1,gn="";function kr(t,e){yi[vi++]=hl,yi[vi++]=dl,dl=t,hl=e}function bv(t,e,n){xt[bt++]=mn,xt[bt++]=gn,xt[bt++]=jr,jr=t;var r=mn;t=gn;var i=32-Wt(r)-1;r&=~(1<<i),n+=1;var s=32-Wt(e)+i;if(30<s){var o=i-i%5;s=(r&(1<<o)-1).toString(32),r>>=o,i-=o,mn=1<<32-Wt(e)+i|n<<i|r,gn=s+t}else mn=1<<s|n<<i|r,gn=t}function Sh(t){t.return!==null&&(kr(t,1),bv(t,1,0))}function Ah(t){for(;t===dl;)dl=yi[--vi],yi[vi]=null,hl=yi[--vi],yi[vi]=null;for(;t===jr;)jr=xt[--bt],xt[bt]=null,gn=xt[--bt],xt[bt]=null,mn=xt[--bt],xt[bt]=null}var Tt=null,wt=null,ve=!1,$t=null;function Nv(t,e){var n=Nt(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function km(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,Tt=t,wt=er(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,Tt=t,wt=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=jr!==null?{id:mn,overflow:gn}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Nt(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,Tt=t,wt=null,!0):!1;default:return!1}}function cd(t){return(t.mode&1)!==0&&(t.flags&128)===0}function dd(t){if(ve){var e=wt;if(e){var n=e;if(!km(t,e)){if(cd(t))throw Error(U(418));e=er(n.nextSibling);var r=Tt;e&&km(t,e)?Nv(r,n):(t.flags=t.flags&-4097|2,ve=!1,Tt=t)}}else{if(cd(t))throw Error(U(418));t.flags=t.flags&-4097|2,ve=!1,Tt=t}}}function Cm(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;Tt=t}function wa(t){if(t!==Tt)return!1;if(!ve)return Cm(t),ve=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!od(t.type,t.memoizedProps)),e&&(e=wt)){if(cd(t))throw Dv(),Error(U(418));for(;e;)Nv(t,e),e=er(e.nextSibling)}if(Cm(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(U(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){wt=er(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}wt=null}}else wt=Tt?er(t.stateNode.nextSibling):null;return!0}function Dv(){for(var t=wt;t;)t=er(t.nextSibling)}function Vi(){wt=Tt=null,ve=!1}function Rh(t){$t===null?$t=[t]:$t.push(t)}var OI=bn.ReactCurrentBatchConfig;function Ts(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(U(309));var r=n.stateNode}if(!r)throw Error(U(147,t));var i=r,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var l=i.refs;o===null?delete l[s]:l[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(U(284));if(!n._owner)throw Error(U(290,t))}return t}function Ea(t,e){throw t=Object.prototype.toString.call(e),Error(U(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function Pm(t){var e=t._init;return e(t._payload)}function Ov(t){function e(w,E){if(t){var S=w.deletions;S===null?(w.deletions=[E],w.flags|=16):S.push(E)}}function n(w,E){if(!t)return null;for(;E!==null;)e(w,E),E=E.sibling;return null}function r(w,E){for(w=new Map;E!==null;)E.key!==null?w.set(E.key,E):w.set(E.index,E),E=E.sibling;return w}function i(w,E){return w=ir(w,E),w.index=0,w.sibling=null,w}function s(w,E,S){return w.index=S,t?(S=w.alternate,S!==null?(S=S.index,S<E?(w.flags|=2,E):S):(w.flags|=2,E)):(w.flags|=1048576,E)}function o(w){return t&&w.alternate===null&&(w.flags|=2),w}function l(w,E,S,N){return E===null||E.tag!==6?(E=Ic(S,w.mode,N),E.return=w,E):(E=i(E,S),E.return=w,E)}function u(w,E,S,N){var V=S.type;return V===di?f(w,E,S.props.children,N,S.key):E!==null&&(E.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===Fn&&Pm(V)===E.type)?(N=i(E,S.props),N.ref=Ts(w,E,S),N.return=w,N):(N=$a(S.type,S.key,S.props,null,w.mode,N),N.ref=Ts(w,E,S),N.return=w,N)}function d(w,E,S,N){return E===null||E.tag!==4||E.stateNode.containerInfo!==S.containerInfo||E.stateNode.implementation!==S.implementation?(E=Sc(S,w.mode,N),E.return=w,E):(E=i(E,S.children||[]),E.return=w,E)}function f(w,E,S,N,V){return E===null||E.tag!==7?(E=Vr(S,w.mode,N,V),E.return=w,E):(E=i(E,S),E.return=w,E)}function m(w,E,S){if(typeof E=="string"&&E!==""||typeof E=="number")return E=Ic(""+E,w.mode,S),E.return=w,E;if(typeof E=="object"&&E!==null){switch(E.$$typeof){case ca:return S=$a(E.type,E.key,E.props,null,w.mode,S),S.ref=Ts(w,null,E),S.return=w,S;case ci:return E=Sc(E,w.mode,S),E.return=w,E;case Fn:var N=E._init;return m(w,N(E._payload),S)}if(ks(E)||ys(E))return E=Vr(E,w.mode,S,null),E.return=w,E;Ea(w,E)}return null}function y(w,E,S,N){var V=E!==null?E.key:null;if(typeof S=="string"&&S!==""||typeof S=="number")return V!==null?null:l(w,E,""+S,N);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case ca:return S.key===V?u(w,E,S,N):null;case ci:return S.key===V?d(w,E,S,N):null;case Fn:return V=S._init,y(w,E,V(S._payload),N)}if(ks(S)||ys(S))return V!==null?null:f(w,E,S,N,null);Ea(w,S)}return null}function R(w,E,S,N,V){if(typeof N=="string"&&N!==""||typeof N=="number")return w=w.get(S)||null,l(E,w,""+N,V);if(typeof N=="object"&&N!==null){switch(N.$$typeof){case ca:return w=w.get(N.key===null?S:N.key)||null,u(E,w,N,V);case ci:return w=w.get(N.key===null?S:N.key)||null,d(E,w,N,V);case Fn:var j=N._init;return R(w,E,S,j(N._payload),V)}if(ks(N)||ys(N))return w=w.get(S)||null,f(E,w,N,V,null);Ea(E,N)}return null}function C(w,E,S,N){for(var V=null,j=null,g=E,_=E=0,T=null;g!==null&&_<S.length;_++){g.index>_?(T=g,g=null):T=g.sibling;var I=y(w,g,S[_],N);if(I===null){g===null&&(g=T);break}t&&g&&I.alternate===null&&e(w,g),E=s(I,E,_),j===null?V=I:j.sibling=I,j=I,g=T}if(_===S.length)return n(w,g),ve&&kr(w,_),V;if(g===null){for(;_<S.length;_++)g=m(w,S[_],N),g!==null&&(E=s(g,E,_),j===null?V=g:j.sibling=g,j=g);return ve&&kr(w,_),V}for(g=r(w,g);_<S.length;_++)T=R(g,w,_,S[_],N),T!==null&&(t&&T.alternate!==null&&g.delete(T.key===null?_:T.key),E=s(T,E,_),j===null?V=T:j.sibling=T,j=T);return t&&g.forEach(function(k){return e(w,k)}),ve&&kr(w,_),V}function b(w,E,S,N){var V=ys(S);if(typeof V!="function")throw Error(U(150));if(S=V.call(S),S==null)throw Error(U(151));for(var j=V=null,g=E,_=E=0,T=null,I=S.next();g!==null&&!I.done;_++,I=S.next()){g.index>_?(T=g,g=null):T=g.sibling;var k=y(w,g,I.value,N);if(k===null){g===null&&(g=T);break}t&&g&&k.alternate===null&&e(w,g),E=s(k,E,_),j===null?V=k:j.sibling=k,j=k,g=T}if(I.done)return n(w,g),ve&&kr(w,_),V;if(g===null){for(;!I.done;_++,I=S.next())I=m(w,I.value,N),I!==null&&(E=s(I,E,_),j===null?V=I:j.sibling=I,j=I);return ve&&kr(w,_),V}for(g=r(w,g);!I.done;_++,I=S.next())I=R(g,w,_,I.value,N),I!==null&&(t&&I.alternate!==null&&g.delete(I.key===null?_:I.key),E=s(I,E,_),j===null?V=I:j.sibling=I,j=I);return t&&g.forEach(function(P){return e(w,P)}),ve&&kr(w,_),V}function L(w,E,S,N){if(typeof S=="object"&&S!==null&&S.type===di&&S.key===null&&(S=S.props.children),typeof S=="object"&&S!==null){switch(S.$$typeof){case ca:e:{for(var V=S.key,j=E;j!==null;){if(j.key===V){if(V=S.type,V===di){if(j.tag===7){n(w,j.sibling),E=i(j,S.props.children),E.return=w,w=E;break e}}else if(j.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===Fn&&Pm(V)===j.type){n(w,j.sibling),E=i(j,S.props),E.ref=Ts(w,j,S),E.return=w,w=E;break e}n(w,j);break}else e(w,j);j=j.sibling}S.type===di?(E=Vr(S.props.children,w.mode,N,S.key),E.return=w,w=E):(N=$a(S.type,S.key,S.props,null,w.mode,N),N.ref=Ts(w,E,S),N.return=w,w=N)}return o(w);case ci:e:{for(j=S.key;E!==null;){if(E.key===j)if(E.tag===4&&E.stateNode.containerInfo===S.containerInfo&&E.stateNode.implementation===S.implementation){n(w,E.sibling),E=i(E,S.children||[]),E.return=w,w=E;break e}else{n(w,E);break}else e(w,E);E=E.sibling}E=Sc(S,w.mode,N),E.return=w,w=E}return o(w);case Fn:return j=S._init,L(w,E,j(S._payload),N)}if(ks(S))return C(w,E,S,N);if(ys(S))return b(w,E,S,N);Ea(w,S)}return typeof S=="string"&&S!==""||typeof S=="number"?(S=""+S,E!==null&&E.tag===6?(n(w,E.sibling),E=i(E,S),E.return=w,w=E):(n(w,E),E=Ic(S,w.mode,N),E.return=w,w=E),o(w)):n(w,E)}return L}var Li=Ov(!0),Vv=Ov(!1),fl=yr(null),pl=null,_i=null,kh=null;function Ch(){kh=_i=pl=null}function Ph(t){var e=fl.current;ye(fl),t._currentValue=e}function hd(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function ki(t,e){pl=t,kh=_i=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(pt=!0),t.firstContext=null)}function Lt(t){var e=t._currentValue;if(kh!==t)if(t={context:t,memoizedValue:e,next:null},_i===null){if(pl===null)throw Error(U(308));_i=t,pl.dependencies={lanes:0,firstContext:t}}else _i=_i.next=t;return e}var br=null;function xh(t){br===null?br=[t]:br.push(t)}function Lv(t,e,n,r){var i=e.interleaved;return i===null?(n.next=n,xh(e)):(n.next=i.next,i.next=n),e.interleaved=n,Sn(t,r)}function Sn(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Un=!1;function bh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Mv(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function wn(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function tr(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,se&2){var i=r.pending;return i===null?e.next=e:(e.next=i.next,i.next=e),r.pending=e,Sn(t,n)}return i=r.interleaved,i===null?(e.next=e,xh(r)):(e.next=i.next,i.next=e),r.interleaved=e,Sn(t,n)}function Ma(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,gh(t,n)}}function xm(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?i=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?i=s=e:s=s.next=e}else i=s=e;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:s,shared:r.shared,effects:r.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function ml(t,e,n,r){var i=t.updateQueue;Un=!1;var s=i.firstBaseUpdate,o=i.lastBaseUpdate,l=i.shared.pending;if(l!==null){i.shared.pending=null;var u=l,d=u.next;u.next=null,o===null?s=d:o.next=d,o=u;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==o&&(l===null?f.firstBaseUpdate=d:l.next=d,f.lastBaseUpdate=u))}if(s!==null){var m=i.baseState;o=0,f=d=u=null,l=s;do{var y=l.lane,R=l.eventTime;if((r&y)===y){f!==null&&(f=f.next={eventTime:R,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var C=t,b=l;switch(y=e,R=n,b.tag){case 1:if(C=b.payload,typeof C=="function"){m=C.call(R,m,y);break e}m=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=b.payload,y=typeof C=="function"?C.call(R,m,y):C,y==null)break e;m=Ee({},m,y);break e;case 2:Un=!0}}l.callback!==null&&l.lane!==0&&(t.flags|=64,y=i.effects,y===null?i.effects=[l]:y.push(l))}else R={eventTime:R,lane:y,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(d=f=R,u=m):f=f.next=R,o|=y;if(l=l.next,l===null){if(l=i.shared.pending,l===null)break;y=l,l=y.next,y.next=null,i.lastBaseUpdate=y,i.shared.pending=null}}while(!0);if(f===null&&(u=m),i.baseState=u,i.firstBaseUpdate=d,i.lastBaseUpdate=f,e=i.shared.interleaved,e!==null){i=e;do o|=i.lane,i=i.next;while(i!==e)}else s===null&&(i.shared.lanes=0);Ur|=o,t.lanes=o,t.memoizedState=m}}function bm(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var r=t[e],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(U(191,i));i.call(r)}}}var ko={},tn=yr(ko),ao=yr(ko),lo=yr(ko);function Nr(t){if(t===ko)throw Error(U(174));return t}function Nh(t,e){switch(fe(lo,e),fe(ao,t),fe(tn,ko),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:Hc(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=Hc(e,t)}ye(tn),fe(tn,e)}function Mi(){ye(tn),ye(ao),ye(lo)}function jv(t){Nr(lo.current);var e=Nr(tn.current),n=Hc(e,t.type);e!==n&&(fe(ao,t),fe(tn,n))}function Dh(t){ao.current===t&&(ye(tn),ye(ao))}var _e=yr(0);function gl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var yc=[];function Oh(){for(var t=0;t<yc.length;t++)yc[t]._workInProgressVersionPrimary=null;yc.length=0}var ja=bn.ReactCurrentDispatcher,vc=bn.ReactCurrentBatchConfig,Fr=0,we=null,Ne=null,Me=null,yl=!1,zs=!1,uo=0,VI=0;function Xe(){throw Error(U(321))}function Vh(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Ht(t[n],e[n]))return!1;return!0}function Lh(t,e,n,r,i,s){if(Fr=s,we=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,ja.current=t===null||t.memoizedState===null?FI:UI,t=n(r,i),zs){s=0;do{if(zs=!1,uo=0,25<=s)throw Error(U(301));s+=1,Me=Ne=null,e.updateQueue=null,ja.current=zI,t=n(r,i)}while(zs)}if(ja.current=vl,e=Ne!==null&&Ne.next!==null,Fr=0,Me=Ne=we=null,yl=!1,e)throw Error(U(300));return t}function Mh(){var t=uo!==0;return uo=0,t}function Yt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Me===null?we.memoizedState=Me=t:Me=Me.next=t,Me}function Mt(){if(Ne===null){var t=we.alternate;t=t!==null?t.memoizedState:null}else t=Ne.next;var e=Me===null?we.memoizedState:Me.next;if(e!==null)Me=e,Ne=t;else{if(t===null)throw Error(U(310));Ne=t,t={memoizedState:Ne.memoizedState,baseState:Ne.baseState,baseQueue:Ne.baseQueue,queue:Ne.queue,next:null},Me===null?we.memoizedState=Me=t:Me=Me.next=t}return Me}function co(t,e){return typeof e=="function"?e(t):e}function _c(t){var e=Mt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=Ne,i=r.baseQueue,s=n.pending;if(s!==null){if(i!==null){var o=i.next;i.next=s.next,s.next=o}r.baseQueue=i=s,n.pending=null}if(i!==null){s=i.next,r=r.baseState;var l=o=null,u=null,d=s;do{var f=d.lane;if((Fr&f)===f)u!==null&&(u=u.next={lane:0,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),r=d.hasEagerState?d.eagerState:t(r,d.action);else{var m={lane:f,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null};u===null?(l=u=m,o=r):u=u.next=m,we.lanes|=f,Ur|=f}d=d.next}while(d!==null&&d!==s);u===null?o=r:u.next=l,Ht(r,e.memoizedState)||(pt=!0),e.memoizedState=r,e.baseState=o,e.baseQueue=u,n.lastRenderedState=r}if(t=n.interleaved,t!==null){i=t;do s=i.lane,we.lanes|=s,Ur|=s,i=i.next;while(i!==t)}else i===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function wc(t){var e=Mt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=n.dispatch,i=n.pending,s=e.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do s=t(s,o.action),o=o.next;while(o!==i);Ht(s,e.memoizedState)||(pt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,r]}function Fv(){}function Uv(t,e){var n=we,r=Mt(),i=e(),s=!Ht(r.memoizedState,i);if(s&&(r.memoizedState=i,pt=!0),r=r.queue,jh($v.bind(null,n,r,t),[t]),r.getSnapshot!==e||s||Me!==null&&Me.memoizedState.tag&1){if(n.flags|=2048,ho(9,Bv.bind(null,n,r,i,e),void 0,null),je===null)throw Error(U(349));Fr&30||zv(n,e,i)}return i}function zv(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=we.updateQueue,e===null?(e={lastEffect:null,stores:null},we.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function Bv(t,e,n,r){e.value=n,e.getSnapshot=r,Wv(e)&&qv(t)}function $v(t,e,n){return n(function(){Wv(e)&&qv(t)})}function Wv(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Ht(t,n)}catch{return!0}}function qv(t){var e=Sn(t,1);e!==null&&qt(e,t,1,-1)}function Nm(t){var e=Yt();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:co,lastRenderedState:t},e.queue=t,t=t.dispatch=jI.bind(null,we,t),[e.memoizedState,t]}function ho(t,e,n,r){return t={tag:t,create:e,destroy:n,deps:r,next:null},e=we.updateQueue,e===null?(e={lastEffect:null,stores:null},we.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t)),t}function Hv(){return Mt().memoizedState}function Fa(t,e,n,r){var i=Yt();we.flags|=t,i.memoizedState=ho(1|e,n,void 0,r===void 0?null:r)}function Ql(t,e,n,r){var i=Mt();r=r===void 0?null:r;var s=void 0;if(Ne!==null){var o=Ne.memoizedState;if(s=o.destroy,r!==null&&Vh(r,o.deps)){i.memoizedState=ho(e,n,s,r);return}}we.flags|=t,i.memoizedState=ho(1|e,n,s,r)}function Dm(t,e){return Fa(8390656,8,t,e)}function jh(t,e){return Ql(2048,8,t,e)}function Kv(t,e){return Ql(4,2,t,e)}function Gv(t,e){return Ql(4,4,t,e)}function Qv(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Yv(t,e,n){return n=n!=null?n.concat([t]):null,Ql(4,4,Qv.bind(null,e,t),n)}function Fh(){}function Xv(t,e){var n=Mt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Vh(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function Jv(t,e){var n=Mt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Vh(e,r[1])?r[0]:(t=t(),n.memoizedState=[t,e],t)}function Zv(t,e,n){return Fr&21?(Ht(n,e)||(n=iv(),we.lanes|=n,Ur|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,pt=!0),t.memoizedState=n)}function LI(t,e){var n=ce;ce=n!==0&&4>n?n:4,t(!0);var r=vc.transition;vc.transition={};try{t(!1),e()}finally{ce=n,vc.transition=r}}function e_(){return Mt().memoizedState}function MI(t,e,n){var r=rr(t);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},t_(t))n_(e,n);else if(n=Lv(t,e,n,r),n!==null){var i=ut();qt(n,t,r,i),r_(n,e,r)}}function jI(t,e,n){var r=rr(t),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(t_(t))n_(e,i);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,l=s(o,n);if(i.hasEagerState=!0,i.eagerState=l,Ht(l,o)){var u=e.interleaved;u===null?(i.next=i,xh(e)):(i.next=u.next,u.next=i),e.interleaved=i;return}}catch{}finally{}n=Lv(t,e,i,r),n!==null&&(i=ut(),qt(n,t,r,i),r_(n,e,r))}}function t_(t){var e=t.alternate;return t===we||e!==null&&e===we}function n_(t,e){zs=yl=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function r_(t,e,n){if(n&4194240){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,gh(t,n)}}var vl={readContext:Lt,useCallback:Xe,useContext:Xe,useEffect:Xe,useImperativeHandle:Xe,useInsertionEffect:Xe,useLayoutEffect:Xe,useMemo:Xe,useReducer:Xe,useRef:Xe,useState:Xe,useDebugValue:Xe,useDeferredValue:Xe,useTransition:Xe,useMutableSource:Xe,useSyncExternalStore:Xe,useId:Xe,unstable_isNewReconciler:!1},FI={readContext:Lt,useCallback:function(t,e){return Yt().memoizedState=[t,e===void 0?null:e],t},useContext:Lt,useEffect:Dm,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,Fa(4194308,4,Qv.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Fa(4194308,4,t,e)},useInsertionEffect:function(t,e){return Fa(4,2,t,e)},useMemo:function(t,e){var n=Yt();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var r=Yt();return e=n!==void 0?n(e):e,r.memoizedState=r.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},r.queue=t,t=t.dispatch=MI.bind(null,we,t),[r.memoizedState,t]},useRef:function(t){var e=Yt();return t={current:t},e.memoizedState=t},useState:Nm,useDebugValue:Fh,useDeferredValue:function(t){return Yt().memoizedState=t},useTransition:function(){var t=Nm(!1),e=t[0];return t=LI.bind(null,t[1]),Yt().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var r=we,i=Yt();if(ve){if(n===void 0)throw Error(U(407));n=n()}else{if(n=e(),je===null)throw Error(U(349));Fr&30||zv(r,e,n)}i.memoizedState=n;var s={value:n,getSnapshot:e};return i.queue=s,Dm($v.bind(null,r,s,t),[t]),r.flags|=2048,ho(9,Bv.bind(null,r,s,n,e),void 0,null),n},useId:function(){var t=Yt(),e=je.identifierPrefix;if(ve){var n=gn,r=mn;n=(r&~(1<<32-Wt(r)-1)).toString(32)+n,e=":"+e+"R"+n,n=uo++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=VI++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},UI={readContext:Lt,useCallback:Xv,useContext:Lt,useEffect:jh,useImperativeHandle:Yv,useInsertionEffect:Kv,useLayoutEffect:Gv,useMemo:Jv,useReducer:_c,useRef:Hv,useState:function(){return _c(co)},useDebugValue:Fh,useDeferredValue:function(t){var e=Mt();return Zv(e,Ne.memoizedState,t)},useTransition:function(){var t=_c(co)[0],e=Mt().memoizedState;return[t,e]},useMutableSource:Fv,useSyncExternalStore:Uv,useId:e_,unstable_isNewReconciler:!1},zI={readContext:Lt,useCallback:Xv,useContext:Lt,useEffect:jh,useImperativeHandle:Yv,useInsertionEffect:Kv,useLayoutEffect:Gv,useMemo:Jv,useReducer:wc,useRef:Hv,useState:function(){return wc(co)},useDebugValue:Fh,useDeferredValue:function(t){var e=Mt();return Ne===null?e.memoizedState=t:Zv(e,Ne.memoizedState,t)},useTransition:function(){var t=wc(co)[0],e=Mt().memoizedState;return[t,e]},useMutableSource:Fv,useSyncExternalStore:Uv,useId:e_,unstable_isNewReconciler:!1};function zt(t,e){if(t&&t.defaultProps){e=Ee({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function fd(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Ee({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Yl={isMounted:function(t){return(t=t._reactInternals)?Yr(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var r=ut(),i=rr(t),s=wn(r,i);s.payload=e,n!=null&&(s.callback=n),e=tr(t,s,i),e!==null&&(qt(e,t,i,r),Ma(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=ut(),i=rr(t),s=wn(r,i);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=tr(t,s,i),e!==null&&(qt(e,t,i,r),Ma(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=ut(),r=rr(t),i=wn(n,r);i.tag=2,e!=null&&(i.callback=e),e=tr(t,i,r),e!==null&&(qt(e,t,r,n),Ma(e,t,r))}};function Om(t,e,n,r,i,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,s,o):e.prototype&&e.prototype.isPureReactComponent?!ro(n,r)||!ro(i,s):!0}function i_(t,e,n){var r=!1,i=dr,s=e.contextType;return typeof s=="object"&&s!==null?s=Lt(s):(i=gt(e)?Mr:it.current,r=e.contextTypes,s=(r=r!=null)?Oi(t,i):dr),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Yl,t.stateNode=e,e._reactInternals=t,r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=s),e}function Vm(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Yl.enqueueReplaceState(e,e.state,null)}function pd(t,e,n,r){var i=t.stateNode;i.props=n,i.state=t.memoizedState,i.refs={},bh(t);var s=e.contextType;typeof s=="object"&&s!==null?i.context=Lt(s):(s=gt(e)?Mr:it.current,i.context=Oi(t,s)),i.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(fd(t,e,s,n),i.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(e=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),e!==i.state&&Yl.enqueueReplaceState(i,i.state,null),ml(t,n,i,r),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308)}function ji(t,e){try{var n="",r=e;do n+=mT(r),r=r.return;while(r);var i=n}catch(s){i=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:i,digest:null}}function Ec(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function md(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var BI=typeof WeakMap=="function"?WeakMap:Map;function s_(t,e,n){n=wn(-1,n),n.tag=3,n.payload={element:null};var r=e.value;return n.callback=function(){wl||(wl=!0,Ad=r),md(t,e)},n}function o_(t,e,n){n=wn(-1,n),n.tag=3;var r=t.type.getDerivedStateFromError;if(typeof r=="function"){var i=e.value;n.payload=function(){return r(i)},n.callback=function(){md(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){md(t,e),typeof r!="function"&&(nr===null?nr=new Set([this]):nr.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function Lm(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new BI;var i=new Set;r.set(e,i)}else i=r.get(e),i===void 0&&(i=new Set,r.set(e,i));i.has(n)||(i.add(n),t=n1.bind(null,t,e,n),e.then(t,t))}function Mm(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function jm(t,e,n,r,i){return t.mode&1?(t.flags|=65536,t.lanes=i,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=wn(-1,1),e.tag=2,tr(n,e,1))),n.lanes|=1),t)}var $I=bn.ReactCurrentOwner,pt=!1;function lt(t,e,n,r){e.child=t===null?Vv(e,null,n,r):Li(e,t.child,n,r)}function Fm(t,e,n,r,i){n=n.render;var s=e.ref;return ki(e,i),r=Lh(t,e,n,r,s,i),n=Mh(),t!==null&&!pt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,An(t,e,i)):(ve&&n&&Sh(e),e.flags|=1,lt(t,e,r,i),e.child)}function Um(t,e,n,r,i){if(t===null){var s=n.type;return typeof s=="function"&&!Kh(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,a_(t,e,s,r,i)):(t=$a(n.type,null,r,e,e.mode,i),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&i)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:ro,n(o,r)&&t.ref===e.ref)return An(t,e,i)}return e.flags|=1,t=ir(s,r),t.ref=e.ref,t.return=e,e.child=t}function a_(t,e,n,r,i){if(t!==null){var s=t.memoizedProps;if(ro(s,r)&&t.ref===e.ref)if(pt=!1,e.pendingProps=r=s,(t.lanes&i)!==0)t.flags&131072&&(pt=!0);else return e.lanes=t.lanes,An(t,e,i)}return gd(t,e,n,r,i)}function l_(t,e,n){var r=e.pendingProps,i=r.children,s=t!==null?t.memoizedState:null;if(r.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},fe(Ei,_t),_t|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,fe(Ei,_t),_t|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=s!==null?s.baseLanes:n,fe(Ei,_t),_t|=r}else s!==null?(r=s.baseLanes|n,e.memoizedState=null):r=n,fe(Ei,_t),_t|=r;return lt(t,e,i,n),e.child}function u_(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function gd(t,e,n,r,i){var s=gt(n)?Mr:it.current;return s=Oi(e,s),ki(e,i),n=Lh(t,e,n,r,s,i),r=Mh(),t!==null&&!pt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,An(t,e,i)):(ve&&r&&Sh(e),e.flags|=1,lt(t,e,n,i),e.child)}function zm(t,e,n,r,i){if(gt(n)){var s=!0;cl(e)}else s=!1;if(ki(e,i),e.stateNode===null)Ua(t,e),i_(e,n,r),pd(e,n,r,i),r=!0;else if(t===null){var o=e.stateNode,l=e.memoizedProps;o.props=l;var u=o.context,d=n.contextType;typeof d=="object"&&d!==null?d=Lt(d):(d=gt(n)?Mr:it.current,d=Oi(e,d));var f=n.getDerivedStateFromProps,m=typeof f=="function"||typeof o.getSnapshotBeforeUpdate=="function";m||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==r||u!==d)&&Vm(e,o,r,d),Un=!1;var y=e.memoizedState;o.state=y,ml(e,r,o,i),u=e.memoizedState,l!==r||y!==u||mt.current||Un?(typeof f=="function"&&(fd(e,n,f,r),u=e.memoizedState),(l=Un||Om(e,n,l,r,y,u,d))?(m||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=u),o.props=r,o.state=u,o.context=d,r=l):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{o=e.stateNode,Mv(t,e),l=e.memoizedProps,d=e.type===e.elementType?l:zt(e.type,l),o.props=d,m=e.pendingProps,y=o.context,u=n.contextType,typeof u=="object"&&u!==null?u=Lt(u):(u=gt(n)?Mr:it.current,u=Oi(e,u));var R=n.getDerivedStateFromProps;(f=typeof R=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==m||y!==u)&&Vm(e,o,r,u),Un=!1,y=e.memoizedState,o.state=y,ml(e,r,o,i);var C=e.memoizedState;l!==m||y!==C||mt.current||Un?(typeof R=="function"&&(fd(e,n,R,r),C=e.memoizedState),(d=Un||Om(e,n,d,r,y,C,u)||!1)?(f||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,C,u),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,C,u)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&y===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&y===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=C),o.props=r,o.state=C,o.context=u,r=d):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&y===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&y===t.memoizedState||(e.flags|=1024),r=!1)}return yd(t,e,n,r,s,i)}function yd(t,e,n,r,i,s){u_(t,e);var o=(e.flags&128)!==0;if(!r&&!o)return i&&Rm(e,n,!1),An(t,e,s);r=e.stateNode,$I.current=e;var l=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return e.flags|=1,t!==null&&o?(e.child=Li(e,t.child,null,s),e.child=Li(e,null,l,s)):lt(t,e,l,s),e.memoizedState=r.state,i&&Rm(e,n,!0),e.child}function c_(t){var e=t.stateNode;e.pendingContext?Am(t,e.pendingContext,e.pendingContext!==e.context):e.context&&Am(t,e.context,!1),Nh(t,e.containerInfo)}function Bm(t,e,n,r,i){return Vi(),Rh(i),e.flags|=256,lt(t,e,n,r),e.child}var vd={dehydrated:null,treeContext:null,retryLane:0};function _d(t){return{baseLanes:t,cachePool:null,transitions:null}}function d_(t,e,n){var r=e.pendingProps,i=_e.current,s=!1,o=(e.flags&128)!==0,l;if((l=o)||(l=t!==null&&t.memoizedState===null?!1:(i&2)!==0),l?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(i|=1),fe(_e,i&1),t===null)return dd(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=r.children,t=r.fallback,s?(r=e.mode,s=e.child,o={mode:"hidden",children:o},!(r&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=Zl(o,r,0,null),t=Vr(t,r,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=_d(n),e.memoizedState=vd,t):Uh(e,o));if(i=t.memoizedState,i!==null&&(l=i.dehydrated,l!==null))return WI(t,e,o,r,l,i,n);if(s){s=r.fallback,o=e.mode,i=t.child,l=i.sibling;var u={mode:"hidden",children:r.children};return!(o&1)&&e.child!==i?(r=e.child,r.childLanes=0,r.pendingProps=u,e.deletions=null):(r=ir(i,u),r.subtreeFlags=i.subtreeFlags&14680064),l!==null?s=ir(l,s):(s=Vr(s,o,n,null),s.flags|=2),s.return=e,r.return=e,r.sibling=s,e.child=r,r=s,s=e.child,o=t.child.memoizedState,o=o===null?_d(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=vd,r}return s=t.child,t=s.sibling,r=ir(s,{mode:"visible",children:r.children}),!(e.mode&1)&&(r.lanes=n),r.return=e,r.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=r,e.memoizedState=null,r}function Uh(t,e){return e=Zl({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function Ta(t,e,n,r){return r!==null&&Rh(r),Li(e,t.child,null,n),t=Uh(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function WI(t,e,n,r,i,s,o){if(n)return e.flags&256?(e.flags&=-257,r=Ec(Error(U(422))),Ta(t,e,o,r)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=r.fallback,i=e.mode,r=Zl({mode:"visible",children:r.children},i,0,null),s=Vr(s,i,o,null),s.flags|=2,r.return=e,s.return=e,r.sibling=s,e.child=r,e.mode&1&&Li(e,t.child,null,o),e.child.memoizedState=_d(o),e.memoizedState=vd,s);if(!(e.mode&1))return Ta(t,e,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var l=r.dgst;return r=l,s=Error(U(419)),r=Ec(s,r,void 0),Ta(t,e,o,r)}if(l=(o&t.childLanes)!==0,pt||l){if(r=je,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==s.retryLane&&(s.retryLane=i,Sn(t,i),qt(r,t,i,-1))}return Hh(),r=Ec(Error(U(421))),Ta(t,e,o,r)}return i.data==="$?"?(e.flags|=128,e.child=t.child,e=r1.bind(null,t),i._reactRetry=e,null):(t=s.treeContext,wt=er(i.nextSibling),Tt=e,ve=!0,$t=null,t!==null&&(xt[bt++]=mn,xt[bt++]=gn,xt[bt++]=jr,mn=t.id,gn=t.overflow,jr=e),e=Uh(e,r.children),e.flags|=4096,e)}function $m(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),hd(t.return,e,n)}function Tc(t,e,n,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=i)}function h_(t,e,n){var r=e.pendingProps,i=r.revealOrder,s=r.tail;if(lt(t,e,r.children,n),r=_e.current,r&2)r=r&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&$m(t,n,e);else if(t.tag===19)$m(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}r&=1}if(fe(_e,r),!(e.mode&1))e.memoizedState=null;else switch(i){case"forwards":for(n=e.child,i=null;n!==null;)t=n.alternate,t!==null&&gl(t)===null&&(i=n),n=n.sibling;n=i,n===null?(i=e.child,e.child=null):(i=n.sibling,n.sibling=null),Tc(e,!1,i,n,s);break;case"backwards":for(n=null,i=e.child,e.child=null;i!==null;){if(t=i.alternate,t!==null&&gl(t)===null){e.child=i;break}t=i.sibling,i.sibling=n,n=i,i=t}Tc(e,!0,n,null,s);break;case"together":Tc(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Ua(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function An(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Ur|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(U(153));if(e.child!==null){for(t=e.child,n=ir(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=ir(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function qI(t,e,n){switch(e.tag){case 3:c_(e),Vi();break;case 5:jv(e);break;case 1:gt(e.type)&&cl(e);break;case 4:Nh(e,e.stateNode.containerInfo);break;case 10:var r=e.type._context,i=e.memoizedProps.value;fe(fl,r._currentValue),r._currentValue=i;break;case 13:if(r=e.memoizedState,r!==null)return r.dehydrated!==null?(fe(_e,_e.current&1),e.flags|=128,null):n&e.child.childLanes?d_(t,e,n):(fe(_e,_e.current&1),t=An(t,e,n),t!==null?t.sibling:null);fe(_e,_e.current&1);break;case 19:if(r=(n&e.childLanes)!==0,t.flags&128){if(r)return h_(t,e,n);e.flags|=128}if(i=e.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),fe(_e,_e.current),r)break;return null;case 22:case 23:return e.lanes=0,l_(t,e,n)}return An(t,e,n)}var f_,wd,p_,m_;f_=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};wd=function(){};p_=function(t,e,n,r){var i=t.memoizedProps;if(i!==r){t=e.stateNode,Nr(tn.current);var s=null;switch(n){case"input":i=Bc(t,i),r=Bc(t,r),s=[];break;case"select":i=Ee({},i,{value:void 0}),r=Ee({},r,{value:void 0}),s=[];break;case"textarea":i=qc(t,i),r=qc(t,r),s=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(t.onclick=ll)}Kc(n,r);var o;n=null;for(d in i)if(!r.hasOwnProperty(d)&&i.hasOwnProperty(d)&&i[d]!=null)if(d==="style"){var l=i[d];for(o in l)l.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else d!=="dangerouslySetInnerHTML"&&d!=="children"&&d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&d!=="autoFocus"&&(Ys.hasOwnProperty(d)?s||(s=[]):(s=s||[]).push(d,null));for(d in r){var u=r[d];if(l=i!=null?i[d]:void 0,r.hasOwnProperty(d)&&u!==l&&(u!=null||l!=null))if(d==="style")if(l){for(o in l)!l.hasOwnProperty(o)||u&&u.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in u)u.hasOwnProperty(o)&&l[o]!==u[o]&&(n||(n={}),n[o]=u[o])}else n||(s||(s=[]),s.push(d,n)),n=u;else d==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,l=l?l.__html:void 0,u!=null&&l!==u&&(s=s||[]).push(d,u)):d==="children"?typeof u!="string"&&typeof u!="number"||(s=s||[]).push(d,""+u):d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&(Ys.hasOwnProperty(d)?(u!=null&&d==="onScroll"&&me("scroll",t),s||l===u||(s=[])):(s=s||[]).push(d,u))}n&&(s=s||[]).push("style",n);var d=s;(e.updateQueue=d)&&(e.flags|=4)}};m_=function(t,e,n,r){n!==r&&(e.flags|=4)};function Is(t,e){if(!ve)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function Je(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=t,i=i.sibling;else for(i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=t,i=i.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function HI(t,e,n){var r=e.pendingProps;switch(Ah(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Je(e),null;case 1:return gt(e.type)&&ul(),Je(e),null;case 3:return r=e.stateNode,Mi(),ye(mt),ye(it),Oh(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(t===null||t.child===null)&&(wa(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,$t!==null&&(Cd($t),$t=null))),wd(t,e),Je(e),null;case 5:Dh(e);var i=Nr(lo.current);if(n=e.type,t!==null&&e.stateNode!=null)p_(t,e,n,r,i),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!r){if(e.stateNode===null)throw Error(U(166));return Je(e),null}if(t=Nr(tn.current),wa(e)){r=e.stateNode,n=e.type;var s=e.memoizedProps;switch(r[Xt]=e,r[oo]=s,t=(e.mode&1)!==0,n){case"dialog":me("cancel",r),me("close",r);break;case"iframe":case"object":case"embed":me("load",r);break;case"video":case"audio":for(i=0;i<Ps.length;i++)me(Ps[i],r);break;case"source":me("error",r);break;case"img":case"image":case"link":me("error",r),me("load",r);break;case"details":me("toggle",r);break;case"input":Jp(r,s),me("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!s.multiple},me("invalid",r);break;case"textarea":em(r,s),me("invalid",r)}Kc(n,s),i=null;for(var o in s)if(s.hasOwnProperty(o)){var l=s[o];o==="children"?typeof l=="string"?r.textContent!==l&&(s.suppressHydrationWarning!==!0&&_a(r.textContent,l,t),i=["children",l]):typeof l=="number"&&r.textContent!==""+l&&(s.suppressHydrationWarning!==!0&&_a(r.textContent,l,t),i=["children",""+l]):Ys.hasOwnProperty(o)&&l!=null&&o==="onScroll"&&me("scroll",r)}switch(n){case"input":da(r),Zp(r,s,!0);break;case"textarea":da(r),tm(r);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(r.onclick=ll)}r=i,e.updateQueue=r,r!==null&&(e.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=$y(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof r.is=="string"?t=o.createElement(n,{is:r.is}):(t=o.createElement(n),n==="select"&&(o=t,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):t=o.createElementNS(t,n),t[Xt]=e,t[oo]=r,f_(t,e,!1,!1),e.stateNode=t;e:{switch(o=Gc(n,r),n){case"dialog":me("cancel",t),me("close",t),i=r;break;case"iframe":case"object":case"embed":me("load",t),i=r;break;case"video":case"audio":for(i=0;i<Ps.length;i++)me(Ps[i],t);i=r;break;case"source":me("error",t),i=r;break;case"img":case"image":case"link":me("error",t),me("load",t),i=r;break;case"details":me("toggle",t),i=r;break;case"input":Jp(t,r),i=Bc(t,r),me("invalid",t);break;case"option":i=r;break;case"select":t._wrapperState={wasMultiple:!!r.multiple},i=Ee({},r,{value:void 0}),me("invalid",t);break;case"textarea":em(t,r),i=qc(t,r),me("invalid",t);break;default:i=r}Kc(n,i),l=i;for(s in l)if(l.hasOwnProperty(s)){var u=l[s];s==="style"?Hy(t,u):s==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&Wy(t,u)):s==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&Xs(t,u):typeof u=="number"&&Xs(t,""+u):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(Ys.hasOwnProperty(s)?u!=null&&s==="onScroll"&&me("scroll",t):u!=null&&ch(t,s,u,o))}switch(n){case"input":da(t),Zp(t,r,!1);break;case"textarea":da(t),tm(t);break;case"option":r.value!=null&&t.setAttribute("value",""+cr(r.value));break;case"select":t.multiple=!!r.multiple,s=r.value,s!=null?Ii(t,!!r.multiple,s,!1):r.defaultValue!=null&&Ii(t,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(t.onclick=ll)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return Je(e),null;case 6:if(t&&e.stateNode!=null)m_(t,e,t.memoizedProps,r);else{if(typeof r!="string"&&e.stateNode===null)throw Error(U(166));if(n=Nr(lo.current),Nr(tn.current),wa(e)){if(r=e.stateNode,n=e.memoizedProps,r[Xt]=e,(s=r.nodeValue!==n)&&(t=Tt,t!==null))switch(t.tag){case 3:_a(r.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&_a(r.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[Xt]=e,e.stateNode=r}return Je(e),null;case 13:if(ye(_e),r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(ve&&wt!==null&&e.mode&1&&!(e.flags&128))Dv(),Vi(),e.flags|=98560,s=!1;else if(s=wa(e),r!==null&&r.dehydrated!==null){if(t===null){if(!s)throw Error(U(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(U(317));s[Xt]=e}else Vi(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Je(e),s=!1}else $t!==null&&(Cd($t),$t=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(r=r!==null,r!==(t!==null&&t.memoizedState!==null)&&r&&(e.child.flags|=8192,e.mode&1&&(t===null||_e.current&1?Oe===0&&(Oe=3):Hh())),e.updateQueue!==null&&(e.flags|=4),Je(e),null);case 4:return Mi(),wd(t,e),t===null&&io(e.stateNode.containerInfo),Je(e),null;case 10:return Ph(e.type._context),Je(e),null;case 17:return gt(e.type)&&ul(),Je(e),null;case 19:if(ye(_e),s=e.memoizedState,s===null)return Je(e),null;if(r=(e.flags&128)!==0,o=s.rendering,o===null)if(r)Is(s,!1);else{if(Oe!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=gl(t),o!==null){for(e.flags|=128,Is(s,!1),r=o.updateQueue,r!==null&&(e.updateQueue=r,e.flags|=4),e.subtreeFlags=0,r=n,n=e.child;n!==null;)s=n,t=r,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return fe(_e,_e.current&1|2),e.child}t=t.sibling}s.tail!==null&&Re()>Fi&&(e.flags|=128,r=!0,Is(s,!1),e.lanes=4194304)}else{if(!r)if(t=gl(o),t!==null){if(e.flags|=128,r=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Is(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!ve)return Je(e),null}else 2*Re()-s.renderingStartTime>Fi&&n!==1073741824&&(e.flags|=128,r=!0,Is(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=Re(),e.sibling=null,n=_e.current,fe(_e,r?n&1|2:n&1),e):(Je(e),null);case 22:case 23:return qh(),r=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==r&&(e.flags|=8192),r&&e.mode&1?_t&1073741824&&(Je(e),e.subtreeFlags&6&&(e.flags|=8192)):Je(e),null;case 24:return null;case 25:return null}throw Error(U(156,e.tag))}function KI(t,e){switch(Ah(e),e.tag){case 1:return gt(e.type)&&ul(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Mi(),ye(mt),ye(it),Oh(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return Dh(e),null;case 13:if(ye(_e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(U(340));Vi()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return ye(_e),null;case 4:return Mi(),null;case 10:return Ph(e.type._context),null;case 22:case 23:return qh(),null;case 24:return null;default:return null}}var Ia=!1,tt=!1,GI=typeof WeakSet=="function"?WeakSet:Set,W=null;function wi(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Se(t,e,r)}else n.current=null}function Ed(t,e,n){try{n()}catch(r){Se(t,e,r)}}var Wm=!1;function QI(t,e){if(id=sl,t=wv(),Ih(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,s=r.focusNode;r=r.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,l=-1,u=-1,d=0,f=0,m=t,y=null;t:for(;;){for(var R;m!==n||i!==0&&m.nodeType!==3||(l=o+i),m!==s||r!==0&&m.nodeType!==3||(u=o+r),m.nodeType===3&&(o+=m.nodeValue.length),(R=m.firstChild)!==null;)y=m,m=R;for(;;){if(m===t)break t;if(y===n&&++d===i&&(l=o),y===s&&++f===r&&(u=o),(R=m.nextSibling)!==null)break;m=y,y=m.parentNode}m=R}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(sd={focusedElem:t,selectionRange:n},sl=!1,W=e;W!==null;)if(e=W,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,W=t;else for(;W!==null;){e=W;try{var C=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(C!==null){var b=C.memoizedProps,L=C.memoizedState,w=e.stateNode,E=w.getSnapshotBeforeUpdate(e.elementType===e.type?b:zt(e.type,b),L);w.__reactInternalSnapshotBeforeUpdate=E}break;case 3:var S=e.stateNode.containerInfo;S.nodeType===1?S.textContent="":S.nodeType===9&&S.documentElement&&S.removeChild(S.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(U(163))}}catch(N){Se(e,e.return,N)}if(t=e.sibling,t!==null){t.return=e.return,W=t;break}W=e.return}return C=Wm,Wm=!1,C}function Bs(t,e,n){var r=e.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&t)===t){var s=i.destroy;i.destroy=void 0,s!==void 0&&Ed(e,n,s)}i=i.next}while(i!==r)}}function Xl(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var r=n.create;n.destroy=r()}n=n.next}while(n!==e)}}function Td(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function g_(t){var e=t.alternate;e!==null&&(t.alternate=null,g_(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Xt],delete e[oo],delete e[ld],delete e[bI],delete e[NI])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function y_(t){return t.tag===5||t.tag===3||t.tag===4}function qm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||y_(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Id(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=ll));else if(r!==4&&(t=t.child,t!==null))for(Id(t,e,n),t=t.sibling;t!==null;)Id(t,e,n),t=t.sibling}function Sd(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(t=t.child,t!==null))for(Sd(t,e,n),t=t.sibling;t!==null;)Sd(t,e,n),t=t.sibling}var ze=null,Bt=!1;function Mn(t,e,n){for(n=n.child;n!==null;)v_(t,e,n),n=n.sibling}function v_(t,e,n){if(en&&typeof en.onCommitFiberUnmount=="function")try{en.onCommitFiberUnmount($l,n)}catch{}switch(n.tag){case 5:tt||wi(n,e);case 6:var r=ze,i=Bt;ze=null,Mn(t,e,n),ze=r,Bt=i,ze!==null&&(Bt?(t=ze,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):ze.removeChild(n.stateNode));break;case 18:ze!==null&&(Bt?(t=ze,n=n.stateNode,t.nodeType===8?mc(t.parentNode,n):t.nodeType===1&&mc(t,n),to(t)):mc(ze,n.stateNode));break;case 4:r=ze,i=Bt,ze=n.stateNode.containerInfo,Bt=!0,Mn(t,e,n),ze=r,Bt=i;break;case 0:case 11:case 14:case 15:if(!tt&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var s=i,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&Ed(n,e,o),i=i.next}while(i!==r)}Mn(t,e,n);break;case 1:if(!tt&&(wi(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(l){Se(n,e,l)}Mn(t,e,n);break;case 21:Mn(t,e,n);break;case 22:n.mode&1?(tt=(r=tt)||n.memoizedState!==null,Mn(t,e,n),tt=r):Mn(t,e,n);break;default:Mn(t,e,n)}}function Hm(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new GI),e.forEach(function(r){var i=i1.bind(null,t,r);n.has(r)||(n.add(r),r.then(i,i))})}}function Ut(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var s=t,o=e,l=o;e:for(;l!==null;){switch(l.tag){case 5:ze=l.stateNode,Bt=!1;break e;case 3:ze=l.stateNode.containerInfo,Bt=!0;break e;case 4:ze=l.stateNode.containerInfo,Bt=!0;break e}l=l.return}if(ze===null)throw Error(U(160));v_(s,o,i),ze=null,Bt=!1;var u=i.alternate;u!==null&&(u.return=null),i.return=null}catch(d){Se(i,e,d)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)__(e,t),e=e.sibling}function __(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Ut(e,t),Qt(t),r&4){try{Bs(3,t,t.return),Xl(3,t)}catch(b){Se(t,t.return,b)}try{Bs(5,t,t.return)}catch(b){Se(t,t.return,b)}}break;case 1:Ut(e,t),Qt(t),r&512&&n!==null&&wi(n,n.return);break;case 5:if(Ut(e,t),Qt(t),r&512&&n!==null&&wi(n,n.return),t.flags&32){var i=t.stateNode;try{Xs(i,"")}catch(b){Se(t,t.return,b)}}if(r&4&&(i=t.stateNode,i!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,l=t.type,u=t.updateQueue;if(t.updateQueue=null,u!==null)try{l==="input"&&s.type==="radio"&&s.name!=null&&zy(i,s),Gc(l,o);var d=Gc(l,s);for(o=0;o<u.length;o+=2){var f=u[o],m=u[o+1];f==="style"?Hy(i,m):f==="dangerouslySetInnerHTML"?Wy(i,m):f==="children"?Xs(i,m):ch(i,f,m,d)}switch(l){case"input":$c(i,s);break;case"textarea":By(i,s);break;case"select":var y=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!s.multiple;var R=s.value;R!=null?Ii(i,!!s.multiple,R,!1):y!==!!s.multiple&&(s.defaultValue!=null?Ii(i,!!s.multiple,s.defaultValue,!0):Ii(i,!!s.multiple,s.multiple?[]:"",!1))}i[oo]=s}catch(b){Se(t,t.return,b)}}break;case 6:if(Ut(e,t),Qt(t),r&4){if(t.stateNode===null)throw Error(U(162));i=t.stateNode,s=t.memoizedProps;try{i.nodeValue=s}catch(b){Se(t,t.return,b)}}break;case 3:if(Ut(e,t),Qt(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{to(e.containerInfo)}catch(b){Se(t,t.return,b)}break;case 4:Ut(e,t),Qt(t);break;case 13:Ut(e,t),Qt(t),i=t.child,i.flags&8192&&(s=i.memoizedState!==null,i.stateNode.isHidden=s,!s||i.alternate!==null&&i.alternate.memoizedState!==null||($h=Re())),r&4&&Hm(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(tt=(d=tt)||f,Ut(e,t),tt=d):Ut(e,t),Qt(t),r&8192){if(d=t.memoizedState!==null,(t.stateNode.isHidden=d)&&!f&&t.mode&1)for(W=t,f=t.child;f!==null;){for(m=W=f;W!==null;){switch(y=W,R=y.child,y.tag){case 0:case 11:case 14:case 15:Bs(4,y,y.return);break;case 1:wi(y,y.return);var C=y.stateNode;if(typeof C.componentWillUnmount=="function"){r=y,n=y.return;try{e=r,C.props=e.memoizedProps,C.state=e.memoizedState,C.componentWillUnmount()}catch(b){Se(r,n,b)}}break;case 5:wi(y,y.return);break;case 22:if(y.memoizedState!==null){Gm(m);continue}}R!==null?(R.return=y,W=R):Gm(m)}f=f.sibling}e:for(f=null,m=t;;){if(m.tag===5){if(f===null){f=m;try{i=m.stateNode,d?(s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(l=m.stateNode,u=m.memoizedProps.style,o=u!=null&&u.hasOwnProperty("display")?u.display:null,l.style.display=qy("display",o))}catch(b){Se(t,t.return,b)}}}else if(m.tag===6){if(f===null)try{m.stateNode.nodeValue=d?"":m.memoizedProps}catch(b){Se(t,t.return,b)}}else if((m.tag!==22&&m.tag!==23||m.memoizedState===null||m===t)&&m.child!==null){m.child.return=m,m=m.child;continue}if(m===t)break e;for(;m.sibling===null;){if(m.return===null||m.return===t)break e;f===m&&(f=null),m=m.return}f===m&&(f=null),m.sibling.return=m.return,m=m.sibling}}break;case 19:Ut(e,t),Qt(t),r&4&&Hm(t);break;case 21:break;default:Ut(e,t),Qt(t)}}function Qt(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(y_(n)){var r=n;break e}n=n.return}throw Error(U(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(Xs(i,""),r.flags&=-33);var s=qm(t);Sd(t,s,i);break;case 3:case 4:var o=r.stateNode.containerInfo,l=qm(t);Id(t,l,o);break;default:throw Error(U(161))}}catch(u){Se(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function YI(t,e,n){W=t,w_(t)}function w_(t,e,n){for(var r=(t.mode&1)!==0;W!==null;){var i=W,s=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||Ia;if(!o){var l=i.alternate,u=l!==null&&l.memoizedState!==null||tt;l=Ia;var d=tt;if(Ia=o,(tt=u)&&!d)for(W=i;W!==null;)o=W,u=o.child,o.tag===22&&o.memoizedState!==null?Qm(i):u!==null?(u.return=o,W=u):Qm(i);for(;s!==null;)W=s,w_(s),s=s.sibling;W=i,Ia=l,tt=d}Km(t)}else i.subtreeFlags&8772&&s!==null?(s.return=i,W=s):Km(t)}}function Km(t){for(;W!==null;){var e=W;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:tt||Xl(5,e);break;case 1:var r=e.stateNode;if(e.flags&4&&!tt)if(n===null)r.componentDidMount();else{var i=e.elementType===e.type?n.memoizedProps:zt(e.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&bm(e,s,r);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}bm(e,o,n)}break;case 5:var l=e.stateNode;if(n===null&&e.flags&4){n=l;var u=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var d=e.alternate;if(d!==null){var f=d.memoizedState;if(f!==null){var m=f.dehydrated;m!==null&&to(m)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(U(163))}tt||e.flags&512&&Td(e)}catch(y){Se(e,e.return,y)}}if(e===t){W=null;break}if(n=e.sibling,n!==null){n.return=e.return,W=n;break}W=e.return}}function Gm(t){for(;W!==null;){var e=W;if(e===t){W=null;break}var n=e.sibling;if(n!==null){n.return=e.return,W=n;break}W=e.return}}function Qm(t){for(;W!==null;){var e=W;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Xl(4,e)}catch(u){Se(e,n,u)}break;case 1:var r=e.stateNode;if(typeof r.componentDidMount=="function"){var i=e.return;try{r.componentDidMount()}catch(u){Se(e,i,u)}}var s=e.return;try{Td(e)}catch(u){Se(e,s,u)}break;case 5:var o=e.return;try{Td(e)}catch(u){Se(e,o,u)}}}catch(u){Se(e,e.return,u)}if(e===t){W=null;break}var l=e.sibling;if(l!==null){l.return=e.return,W=l;break}W=e.return}}var XI=Math.ceil,_l=bn.ReactCurrentDispatcher,zh=bn.ReactCurrentOwner,Dt=bn.ReactCurrentBatchConfig,se=0,je=null,Pe=null,We=0,_t=0,Ei=yr(0),Oe=0,fo=null,Ur=0,Jl=0,Bh=0,$s=null,ht=null,$h=0,Fi=1/0,fn=null,wl=!1,Ad=null,nr=null,Sa=!1,Qn=null,El=0,Ws=0,Rd=null,za=-1,Ba=0;function ut(){return se&6?Re():za!==-1?za:za=Re()}function rr(t){return t.mode&1?se&2&&We!==0?We&-We:OI.transition!==null?(Ba===0&&(Ba=iv()),Ba):(t=ce,t!==0||(t=window.event,t=t===void 0?16:dv(t.type)),t):1}function qt(t,e,n,r){if(50<Ws)throw Ws=0,Rd=null,Error(U(185));So(t,n,r),(!(se&2)||t!==je)&&(t===je&&(!(se&2)&&(Jl|=n),Oe===4&&Bn(t,We)),yt(t,r),n===1&&se===0&&!(e.mode&1)&&(Fi=Re()+500,Gl&&vr()))}function yt(t,e){var n=t.callbackNode;OT(t,e);var r=il(t,t===je?We:0);if(r===0)n!==null&&im(n),t.callbackNode=null,t.callbackPriority=0;else if(e=r&-r,t.callbackPriority!==e){if(n!=null&&im(n),e===1)t.tag===0?DI(Ym.bind(null,t)):xv(Ym.bind(null,t)),PI(function(){!(se&6)&&vr()}),n=null;else{switch(sv(r)){case 1:n=mh;break;case 4:n=nv;break;case 16:n=rl;break;case 536870912:n=rv;break;default:n=rl}n=C_(n,E_.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function E_(t,e){if(za=-1,Ba=0,se&6)throw Error(U(327));var n=t.callbackNode;if(Ci()&&t.callbackNode!==n)return null;var r=il(t,t===je?We:0);if(r===0)return null;if(r&30||r&t.expiredLanes||e)e=Tl(t,r);else{e=r;var i=se;se|=2;var s=I_();(je!==t||We!==e)&&(fn=null,Fi=Re()+500,Or(t,e));do try{e1();break}catch(l){T_(t,l)}while(!0);Ch(),_l.current=s,se=i,Pe!==null?e=0:(je=null,We=0,e=Oe)}if(e!==0){if(e===2&&(i=Zc(t),i!==0&&(r=i,e=kd(t,i))),e===1)throw n=fo,Or(t,0),Bn(t,r),yt(t,Re()),n;if(e===6)Bn(t,r);else{if(i=t.current.alternate,!(r&30)&&!JI(i)&&(e=Tl(t,r),e===2&&(s=Zc(t),s!==0&&(r=s,e=kd(t,s))),e===1))throw n=fo,Or(t,0),Bn(t,r),yt(t,Re()),n;switch(t.finishedWork=i,t.finishedLanes=r,e){case 0:case 1:throw Error(U(345));case 2:Cr(t,ht,fn);break;case 3:if(Bn(t,r),(r&130023424)===r&&(e=$h+500-Re(),10<e)){if(il(t,0)!==0)break;if(i=t.suspendedLanes,(i&r)!==r){ut(),t.pingedLanes|=t.suspendedLanes&i;break}t.timeoutHandle=ad(Cr.bind(null,t,ht,fn),e);break}Cr(t,ht,fn);break;case 4:if(Bn(t,r),(r&4194240)===r)break;for(e=t.eventTimes,i=-1;0<r;){var o=31-Wt(r);s=1<<o,o=e[o],o>i&&(i=o),r&=~s}if(r=i,r=Re()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*XI(r/1960))-r,10<r){t.timeoutHandle=ad(Cr.bind(null,t,ht,fn),r);break}Cr(t,ht,fn);break;case 5:Cr(t,ht,fn);break;default:throw Error(U(329))}}}return yt(t,Re()),t.callbackNode===n?E_.bind(null,t):null}function kd(t,e){var n=$s;return t.current.memoizedState.isDehydrated&&(Or(t,e).flags|=256),t=Tl(t,e),t!==2&&(e=ht,ht=n,e!==null&&Cd(e)),t}function Cd(t){ht===null?ht=t:ht.push.apply(ht,t)}function JI(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],s=i.getSnapshot;i=i.value;try{if(!Ht(s(),i))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Bn(t,e){for(e&=~Bh,e&=~Jl,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-Wt(e),r=1<<n;t[n]=-1,e&=~r}}function Ym(t){if(se&6)throw Error(U(327));Ci();var e=il(t,0);if(!(e&1))return yt(t,Re()),null;var n=Tl(t,e);if(t.tag!==0&&n===2){var r=Zc(t);r!==0&&(e=r,n=kd(t,r))}if(n===1)throw n=fo,Or(t,0),Bn(t,e),yt(t,Re()),n;if(n===6)throw Error(U(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,Cr(t,ht,fn),yt(t,Re()),null}function Wh(t,e){var n=se;se|=1;try{return t(e)}finally{se=n,se===0&&(Fi=Re()+500,Gl&&vr())}}function zr(t){Qn!==null&&Qn.tag===0&&!(se&6)&&Ci();var e=se;se|=1;var n=Dt.transition,r=ce;try{if(Dt.transition=null,ce=1,t)return t()}finally{ce=r,Dt.transition=n,se=e,!(se&6)&&vr()}}function qh(){_t=Ei.current,ye(Ei)}function Or(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,CI(n)),Pe!==null)for(n=Pe.return;n!==null;){var r=n;switch(Ah(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&ul();break;case 3:Mi(),ye(mt),ye(it),Oh();break;case 5:Dh(r);break;case 4:Mi();break;case 13:ye(_e);break;case 19:ye(_e);break;case 10:Ph(r.type._context);break;case 22:case 23:qh()}n=n.return}if(je=t,Pe=t=ir(t.current,null),We=_t=e,Oe=0,fo=null,Bh=Jl=Ur=0,ht=$s=null,br!==null){for(e=0;e<br.length;e++)if(n=br[e],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,s=n.pending;if(s!==null){var o=s.next;s.next=i,r.next=o}n.pending=r}br=null}return t}function T_(t,e){do{var n=Pe;try{if(Ch(),ja.current=vl,yl){for(var r=we.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}yl=!1}if(Fr=0,Me=Ne=we=null,zs=!1,uo=0,zh.current=null,n===null||n.return===null){Oe=1,fo=e,Pe=null;break}e:{var s=t,o=n.return,l=n,u=e;if(e=We,l.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var d=u,f=l,m=f.tag;if(!(f.mode&1)&&(m===0||m===11||m===15)){var y=f.alternate;y?(f.updateQueue=y.updateQueue,f.memoizedState=y.memoizedState,f.lanes=y.lanes):(f.updateQueue=null,f.memoizedState=null)}var R=Mm(o);if(R!==null){R.flags&=-257,jm(R,o,l,s,e),R.mode&1&&Lm(s,d,e),e=R,u=d;var C=e.updateQueue;if(C===null){var b=new Set;b.add(u),e.updateQueue=b}else C.add(u);break e}else{if(!(e&1)){Lm(s,d,e),Hh();break e}u=Error(U(426))}}else if(ve&&l.mode&1){var L=Mm(o);if(L!==null){!(L.flags&65536)&&(L.flags|=256),jm(L,o,l,s,e),Rh(ji(u,l));break e}}s=u=ji(u,l),Oe!==4&&(Oe=2),$s===null?$s=[s]:$s.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var w=s_(s,u,e);xm(s,w);break e;case 1:l=u;var E=s.type,S=s.stateNode;if(!(s.flags&128)&&(typeof E.getDerivedStateFromError=="function"||S!==null&&typeof S.componentDidCatch=="function"&&(nr===null||!nr.has(S)))){s.flags|=65536,e&=-e,s.lanes|=e;var N=o_(s,l,e);xm(s,N);break e}}s=s.return}while(s!==null)}A_(n)}catch(V){e=V,Pe===n&&n!==null&&(Pe=n=n.return);continue}break}while(!0)}function I_(){var t=_l.current;return _l.current=vl,t===null?vl:t}function Hh(){(Oe===0||Oe===3||Oe===2)&&(Oe=4),je===null||!(Ur&268435455)&&!(Jl&268435455)||Bn(je,We)}function Tl(t,e){var n=se;se|=2;var r=I_();(je!==t||We!==e)&&(fn=null,Or(t,e));do try{ZI();break}catch(i){T_(t,i)}while(!0);if(Ch(),se=n,_l.current=r,Pe!==null)throw Error(U(261));return je=null,We=0,Oe}function ZI(){for(;Pe!==null;)S_(Pe)}function e1(){for(;Pe!==null&&!AT();)S_(Pe)}function S_(t){var e=k_(t.alternate,t,_t);t.memoizedProps=t.pendingProps,e===null?A_(t):Pe=e,zh.current=null}function A_(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=KI(n,e),n!==null){n.flags&=32767,Pe=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Oe=6,Pe=null;return}}else if(n=HI(n,e,_t),n!==null){Pe=n;return}if(e=e.sibling,e!==null){Pe=e;return}Pe=e=t}while(e!==null);Oe===0&&(Oe=5)}function Cr(t,e,n){var r=ce,i=Dt.transition;try{Dt.transition=null,ce=1,t1(t,e,n,r)}finally{Dt.transition=i,ce=r}return null}function t1(t,e,n,r){do Ci();while(Qn!==null);if(se&6)throw Error(U(327));n=t.finishedWork;var i=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(U(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(VT(t,s),t===je&&(Pe=je=null,We=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Sa||(Sa=!0,C_(rl,function(){return Ci(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Dt.transition,Dt.transition=null;var o=ce;ce=1;var l=se;se|=4,zh.current=null,QI(t,n),__(n,t),EI(sd),sl=!!id,sd=id=null,t.current=n,YI(n),RT(),se=l,ce=o,Dt.transition=s}else t.current=n;if(Sa&&(Sa=!1,Qn=t,El=i),s=t.pendingLanes,s===0&&(nr=null),PT(n.stateNode),yt(t,Re()),e!==null)for(r=t.onRecoverableError,n=0;n<e.length;n++)i=e[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(wl)throw wl=!1,t=Ad,Ad=null,t;return El&1&&t.tag!==0&&Ci(),s=t.pendingLanes,s&1?t===Rd?Ws++:(Ws=0,Rd=t):Ws=0,vr(),null}function Ci(){if(Qn!==null){var t=sv(El),e=Dt.transition,n=ce;try{if(Dt.transition=null,ce=16>t?16:t,Qn===null)var r=!1;else{if(t=Qn,Qn=null,El=0,se&6)throw Error(U(331));var i=se;for(se|=4,W=t.current;W!==null;){var s=W,o=s.child;if(W.flags&16){var l=s.deletions;if(l!==null){for(var u=0;u<l.length;u++){var d=l[u];for(W=d;W!==null;){var f=W;switch(f.tag){case 0:case 11:case 15:Bs(8,f,s)}var m=f.child;if(m!==null)m.return=f,W=m;else for(;W!==null;){f=W;var y=f.sibling,R=f.return;if(g_(f),f===d){W=null;break}if(y!==null){y.return=R,W=y;break}W=R}}}var C=s.alternate;if(C!==null){var b=C.child;if(b!==null){C.child=null;do{var L=b.sibling;b.sibling=null,b=L}while(b!==null)}}W=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,W=o;else e:for(;W!==null;){if(s=W,s.flags&2048)switch(s.tag){case 0:case 11:case 15:Bs(9,s,s.return)}var w=s.sibling;if(w!==null){w.return=s.return,W=w;break e}W=s.return}}var E=t.current;for(W=E;W!==null;){o=W;var S=o.child;if(o.subtreeFlags&2064&&S!==null)S.return=o,W=S;else e:for(o=E;W!==null;){if(l=W,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:Xl(9,l)}}catch(V){Se(l,l.return,V)}if(l===o){W=null;break e}var N=l.sibling;if(N!==null){N.return=l.return,W=N;break e}W=l.return}}if(se=i,vr(),en&&typeof en.onPostCommitFiberRoot=="function")try{en.onPostCommitFiberRoot($l,t)}catch{}r=!0}return r}finally{ce=n,Dt.transition=e}}return!1}function Xm(t,e,n){e=ji(n,e),e=s_(t,e,1),t=tr(t,e,1),e=ut(),t!==null&&(So(t,1,e),yt(t,e))}function Se(t,e,n){if(t.tag===3)Xm(t,t,n);else for(;e!==null;){if(e.tag===3){Xm(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(nr===null||!nr.has(r))){t=ji(n,t),t=o_(e,t,1),e=tr(e,t,1),t=ut(),e!==null&&(So(e,1,t),yt(e,t));break}}e=e.return}}function n1(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),e=ut(),t.pingedLanes|=t.suspendedLanes&n,je===t&&(We&n)===n&&(Oe===4||Oe===3&&(We&130023424)===We&&500>Re()-$h?Or(t,0):Bh|=n),yt(t,e)}function R_(t,e){e===0&&(t.mode&1?(e=pa,pa<<=1,!(pa&130023424)&&(pa=4194304)):e=1);var n=ut();t=Sn(t,e),t!==null&&(So(t,e,n),yt(t,n))}function r1(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),R_(t,n)}function i1(t,e){var n=0;switch(t.tag){case 13:var r=t.stateNode,i=t.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=t.stateNode;break;default:throw Error(U(314))}r!==null&&r.delete(e),R_(t,n)}var k_;k_=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||mt.current)pt=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return pt=!1,qI(t,e,n);pt=!!(t.flags&131072)}else pt=!1,ve&&e.flags&1048576&&bv(e,hl,e.index);switch(e.lanes=0,e.tag){case 2:var r=e.type;Ua(t,e),t=e.pendingProps;var i=Oi(e,it.current);ki(e,n),i=Lh(null,e,r,t,i,n);var s=Mh();return e.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,gt(r)?(s=!0,cl(e)):s=!1,e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,bh(e),i.updater=Yl,e.stateNode=i,i._reactInternals=e,pd(e,r,t,n),e=yd(null,e,r,!0,s,n)):(e.tag=0,ve&&s&&Sh(e),lt(null,e,i,n),e=e.child),e;case 16:r=e.elementType;e:{switch(Ua(t,e),t=e.pendingProps,i=r._init,r=i(r._payload),e.type=r,i=e.tag=o1(r),t=zt(r,t),i){case 0:e=gd(null,e,r,t,n);break e;case 1:e=zm(null,e,r,t,n);break e;case 11:e=Fm(null,e,r,t,n);break e;case 14:e=Um(null,e,r,zt(r.type,t),n);break e}throw Error(U(306,r,""))}return e;case 0:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:zt(r,i),gd(t,e,r,i,n);case 1:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:zt(r,i),zm(t,e,r,i,n);case 3:e:{if(c_(e),t===null)throw Error(U(387));r=e.pendingProps,s=e.memoizedState,i=s.element,Mv(t,e),ml(e,r,null,n);var o=e.memoizedState;if(r=o.element,s.isDehydrated)if(s={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){i=ji(Error(U(423)),e),e=Bm(t,e,r,n,i);break e}else if(r!==i){i=ji(Error(U(424)),e),e=Bm(t,e,r,n,i);break e}else for(wt=er(e.stateNode.containerInfo.firstChild),Tt=e,ve=!0,$t=null,n=Vv(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Vi(),r===i){e=An(t,e,n);break e}lt(t,e,r,n)}e=e.child}return e;case 5:return jv(e),t===null&&dd(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,o=i.children,od(r,i)?o=null:s!==null&&od(r,s)&&(e.flags|=32),u_(t,e),lt(t,e,o,n),e.child;case 6:return t===null&&dd(e),null;case 13:return d_(t,e,n);case 4:return Nh(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=Li(e,null,r,n):lt(t,e,r,n),e.child;case 11:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:zt(r,i),Fm(t,e,r,i,n);case 7:return lt(t,e,e.pendingProps,n),e.child;case 8:return lt(t,e,e.pendingProps.children,n),e.child;case 12:return lt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(r=e.type._context,i=e.pendingProps,s=e.memoizedProps,o=i.value,fe(fl,r._currentValue),r._currentValue=o,s!==null)if(Ht(s.value,o)){if(s.children===i.children&&!mt.current){e=An(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var l=s.dependencies;if(l!==null){o=s.child;for(var u=l.firstContext;u!==null;){if(u.context===r){if(s.tag===1){u=wn(-1,n&-n),u.tag=2;var d=s.updateQueue;if(d!==null){d=d.shared;var f=d.pending;f===null?u.next=u:(u.next=f.next,f.next=u),d.pending=u}}s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),hd(s.return,n,e),l.lanes|=n;break}u=u.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(U(341));o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),hd(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}lt(t,e,i.children,n),e=e.child}return e;case 9:return i=e.type,r=e.pendingProps.children,ki(e,n),i=Lt(i),r=r(i),e.flags|=1,lt(t,e,r,n),e.child;case 14:return r=e.type,i=zt(r,e.pendingProps),i=zt(r.type,i),Um(t,e,r,i,n);case 15:return a_(t,e,e.type,e.pendingProps,n);case 17:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:zt(r,i),Ua(t,e),e.tag=1,gt(r)?(t=!0,cl(e)):t=!1,ki(e,n),i_(e,r,i),pd(e,r,i,n),yd(null,e,r,!0,t,n);case 19:return h_(t,e,n);case 22:return l_(t,e,n)}throw Error(U(156,e.tag))};function C_(t,e){return tv(t,e)}function s1(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Nt(t,e,n,r){return new s1(t,e,n,r)}function Kh(t){return t=t.prototype,!(!t||!t.isReactComponent)}function o1(t){if(typeof t=="function")return Kh(t)?1:0;if(t!=null){if(t=t.$$typeof,t===hh)return 11;if(t===fh)return 14}return 2}function ir(t,e){var n=t.alternate;return n===null?(n=Nt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function $a(t,e,n,r,i,s){var o=2;if(r=t,typeof t=="function")Kh(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case di:return Vr(n.children,i,s,e);case dh:o=8,i|=8;break;case jc:return t=Nt(12,n,e,i|2),t.elementType=jc,t.lanes=s,t;case Fc:return t=Nt(13,n,e,i),t.elementType=Fc,t.lanes=s,t;case Uc:return t=Nt(19,n,e,i),t.elementType=Uc,t.lanes=s,t;case jy:return Zl(n,i,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Ly:o=10;break e;case My:o=9;break e;case hh:o=11;break e;case fh:o=14;break e;case Fn:o=16,r=null;break e}throw Error(U(130,t==null?t:typeof t,""))}return e=Nt(o,n,e,i),e.elementType=t,e.type=r,e.lanes=s,e}function Vr(t,e,n,r){return t=Nt(7,t,r,e),t.lanes=n,t}function Zl(t,e,n,r){return t=Nt(22,t,r,e),t.elementType=jy,t.lanes=n,t.stateNode={isHidden:!1},t}function Ic(t,e,n){return t=Nt(6,t,null,e),t.lanes=n,t}function Sc(t,e,n){return e=Nt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function a1(t,e,n,r,i){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ic(0),this.expirationTimes=ic(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ic(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function Gh(t,e,n,r,i,s,o,l,u){return t=new a1(t,e,n,l,u),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Nt(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},bh(s),t}function l1(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ci,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}function P_(t){if(!t)return dr;t=t._reactInternals;e:{if(Yr(t)!==t||t.tag!==1)throw Error(U(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(gt(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(U(171))}if(t.tag===1){var n=t.type;if(gt(n))return Pv(t,n,e)}return e}function x_(t,e,n,r,i,s,o,l,u){return t=Gh(n,r,!0,t,i,s,o,l,u),t.context=P_(null),n=t.current,r=ut(),i=rr(n),s=wn(r,i),s.callback=e??null,tr(n,s,i),t.current.lanes=i,So(t,i,r),yt(t,r),t}function eu(t,e,n,r){var i=e.current,s=ut(),o=rr(i);return n=P_(n),e.context===null?e.context=n:e.pendingContext=n,e=wn(s,o),e.payload={element:t},r=r===void 0?null:r,r!==null&&(e.callback=r),t=tr(i,e,o),t!==null&&(qt(t,i,o,s),Ma(t,i,o)),o}function Il(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function Jm(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Qh(t,e){Jm(t,e),(t=t.alternate)&&Jm(t,e)}function u1(){return null}var b_=typeof reportError=="function"?reportError:function(t){console.error(t)};function Yh(t){this._internalRoot=t}tu.prototype.render=Yh.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(U(409));eu(t,e,null,null)};tu.prototype.unmount=Yh.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;zr(function(){eu(null,t,null,null)}),e[In]=null}};function tu(t){this._internalRoot=t}tu.prototype.unstable_scheduleHydration=function(t){if(t){var e=lv();t={blockedOn:null,target:t,priority:e};for(var n=0;n<zn.length&&e!==0&&e<zn[n].priority;n++);zn.splice(n,0,t),n===0&&cv(t)}};function Xh(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function nu(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function Zm(){}function c1(t,e,n,r,i){if(i){if(typeof r=="function"){var s=r;r=function(){var d=Il(o);s.call(d)}}var o=x_(e,r,t,0,null,!1,!1,"",Zm);return t._reactRootContainer=o,t[In]=o.current,io(t.nodeType===8?t.parentNode:t),zr(),o}for(;i=t.lastChild;)t.removeChild(i);if(typeof r=="function"){var l=r;r=function(){var d=Il(u);l.call(d)}}var u=Gh(t,0,!1,null,null,!1,!1,"",Zm);return t._reactRootContainer=u,t[In]=u.current,io(t.nodeType===8?t.parentNode:t),zr(function(){eu(e,u,n,r)}),u}function ru(t,e,n,r,i){var s=n._reactRootContainer;if(s){var o=s;if(typeof i=="function"){var l=i;i=function(){var u=Il(o);l.call(u)}}eu(e,o,t,i)}else o=c1(n,e,t,i,r);return Il(o)}ov=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Cs(e.pendingLanes);n!==0&&(gh(e,n|1),yt(e,Re()),!(se&6)&&(Fi=Re()+500,vr()))}break;case 13:zr(function(){var r=Sn(t,1);if(r!==null){var i=ut();qt(r,t,1,i)}}),Qh(t,1)}};yh=function(t){if(t.tag===13){var e=Sn(t,134217728);if(e!==null){var n=ut();qt(e,t,134217728,n)}Qh(t,134217728)}};av=function(t){if(t.tag===13){var e=rr(t),n=Sn(t,e);if(n!==null){var r=ut();qt(n,t,e,r)}Qh(t,e)}};lv=function(){return ce};uv=function(t,e){var n=ce;try{return ce=t,e()}finally{ce=n}};Yc=function(t,e,n){switch(e){case"input":if($c(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var i=Kl(r);if(!i)throw Error(U(90));Uy(r),$c(r,i)}}}break;case"textarea":By(t,n);break;case"select":e=n.value,e!=null&&Ii(t,!!n.multiple,e,!1)}};Qy=Wh;Yy=zr;var d1={usingClientEntryPoint:!1,Events:[Ro,mi,Kl,Ky,Gy,Wh]},Ss={findFiberByHostInstance:xr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},h1={bundleType:Ss.bundleType,version:Ss.version,rendererPackageName:Ss.rendererPackageName,rendererConfig:Ss.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:bn.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=Zy(t),t===null?null:t.stateNode},findFiberByHostInstance:Ss.findFiberByHostInstance||u1,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Aa=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Aa.isDisabled&&Aa.supportsFiber)try{$l=Aa.inject(h1),en=Aa}catch{}}St.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=d1;St.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Xh(e))throw Error(U(200));return l1(t,e,null,n)};St.createRoot=function(t,e){if(!Xh(t))throw Error(U(299));var n=!1,r="",i=b_;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=Gh(t,1,!1,null,null,n,!1,r,i),t[In]=e.current,io(t.nodeType===8?t.parentNode:t),new Yh(e)};St.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(U(188)):(t=Object.keys(t).join(","),Error(U(268,t)));return t=Zy(e),t=t===null?null:t.stateNode,t};St.flushSync=function(t){return zr(t)};St.hydrate=function(t,e,n){if(!nu(e))throw Error(U(200));return ru(null,t,e,!0,n)};St.hydrateRoot=function(t,e,n){if(!Xh(t))throw Error(U(405));var r=n!=null&&n.hydratedSources||null,i=!1,s="",o=b_;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=x_(e,null,t,1,n??null,i,!1,s,o),t[In]=e.current,io(t),r)for(t=0;t<r.length;t++)n=r[t],i=n._getVersion,i=i(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,i]:e.mutableSourceEagerHydrationData.push(n,i);return new tu(e)};St.render=function(t,e,n){if(!nu(e))throw Error(U(200));return ru(null,t,e,!1,n)};St.unmountComponentAtNode=function(t){if(!nu(t))throw Error(U(40));return t._reactRootContainer?(zr(function(){ru(null,null,t,!1,function(){t._reactRootContainer=null,t[In]=null})}),!0):!1};St.unstable_batchedUpdates=Wh;St.unstable_renderSubtreeIntoContainer=function(t,e,n,r){if(!nu(n))throw Error(U(200));if(t==null||t._reactInternals===void 0)throw Error(U(38));return ru(t,e,n,!1,r)};St.version="18.3.1-next-f1338f8080-20240426";function N_(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(N_)}catch(t){console.error(t)}}N_(),Ny.exports=St;var f1=Ny.exports,eg=f1;Lc.createRoot=eg.createRoot,Lc.hydrateRoot=eg.hydrateRoot;let p1={data:""},m1=t=>{if(typeof window=="object"){let e=(t?t.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return e.nonce=window.__nonce__,e.parentNode||(t||document.head).appendChild(e),e.firstChild}return t||p1},g1=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,y1=/\/\*[^]*?\*\/|  +/g,tg=/\n+/g,$n=(t,e)=>{let n="",r="",i="";for(let s in t){let o=t[s];s[0]=="@"?s[1]=="i"?n=s+" "+o+";":r+=s[1]=="f"?$n(o,s):s+"{"+$n(o,s[1]=="k"?"":e)+"}":typeof o=="object"?r+=$n(o,e?e.replace(/([^,])+/g,l=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,u=>/&/.test(u)?u.replace(/&/g,l):l?l+" "+u:u)):s):o!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=$n.p?$n.p(s,o):s+":"+o+";")}return n+(e&&i?e+"{"+i+"}":i)+r},hn={},D_=t=>{if(typeof t=="object"){let e="";for(let n in t)e+=n+D_(t[n]);return e}return t},v1=(t,e,n,r,i)=>{let s=D_(t),o=hn[s]||(hn[s]=(u=>{let d=0,f=11;for(;d<u.length;)f=101*f+u.charCodeAt(d++)>>>0;return"go"+f})(s));if(!hn[o]){let u=s!==t?t:(d=>{let f,m,y=[{}];for(;f=g1.exec(d.replace(y1,""));)f[4]?y.shift():f[3]?(m=f[3].replace(tg," ").trim(),y.unshift(y[0][m]=y[0][m]||{})):y[0][f[1]]=f[2].replace(tg," ").trim();return y[0]})(t);hn[o]=$n(i?{["@keyframes "+o]:u}:u,n?"":"."+o)}let l=n&&hn.g?hn.g:null;return n&&(hn.g=hn[o]),((u,d,f,m)=>{m?d.data=d.data.replace(m,u):d.data.indexOf(u)===-1&&(d.data=f?u+d.data:d.data+u)})(hn[o],e,r,l),o},_1=(t,e,n)=>t.reduce((r,i,s)=>{let o=e[s];if(o&&o.call){let l=o(n),u=l&&l.props&&l.props.className||/^go/.test(l)&&l;o=u?"."+u:l&&typeof l=="object"?l.props?"":$n(l,""):l===!1?"":l}return r+i+(o??"")},"");function iu(t){let e=this||{},n=t.call?t(e.p):t;return v1(n.unshift?n.raw?_1(n,[].slice.call(arguments,1),e.p):n.reduce((r,i)=>Object.assign(r,i&&i.call?i(e.p):i),{}):n,m1(e.target),e.g,e.o,e.k)}let O_,Pd,xd;iu.bind({g:1});let Rn=iu.bind({k:1});function w1(t,e,n,r){$n.p=e,O_=t,Pd=n,xd=r}function _r(t,e){let n=this||{};return function(){let r=arguments;function i(s,o){let l=Object.assign({},s),u=l.className||i.className;n.p=Object.assign({theme:Pd&&Pd()},l),n.o=/ *go\d+/.test(u),l.className=iu.apply(n,r)+(u?" "+u:"");let d=t;return t[0]&&(d=l.as||t,delete l.as),xd&&d[0]&&xd(l),O_(d,l)}return i}}var E1=t=>typeof t=="function",Sl=(t,e)=>E1(t)?t(e):t,T1=(()=>{let t=0;return()=>(++t).toString()})(),V_=(()=>{let t;return()=>{if(t===void 0&&typeof window<"u"){let e=matchMedia("(prefers-reduced-motion: reduce)");t=!e||e.matches}return t}})(),I1=20,Jh="default",L_=(t,e)=>{let{toastLimit:n}=t.settings;switch(e.type){case 0:return{...t,toasts:[e.toast,...t.toasts].slice(0,n)};case 1:return{...t,toasts:t.toasts.map(o=>o.id===e.toast.id?{...o,...e.toast}:o)};case 2:let{toast:r}=e;return L_(t,{type:t.toasts.find(o=>o.id===r.id)?1:0,toast:r});case 3:let{toastId:i}=e;return{...t,toasts:t.toasts.map(o=>o.id===i||i===void 0?{...o,dismissed:!0,visible:!1}:o)};case 4:return e.toastId===void 0?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(o=>o.id!==e.toastId)};case 5:return{...t,pausedAt:e.time};case 6:let s=e.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(o=>({...o,pauseDuration:o.pauseDuration+s}))}}},Wa=[],M_={toasts:[],pausedAt:void 0,settings:{toastLimit:I1}},Jt={},j_=(t,e=Jh)=>{Jt[e]=L_(Jt[e]||M_,t),Wa.forEach(([n,r])=>{n===e&&r(Jt[e])})},F_=t=>Object.keys(Jt).forEach(e=>j_(t,e)),S1=t=>Object.keys(Jt).find(e=>Jt[e].toasts.some(n=>n.id===t)),su=(t=Jh)=>e=>{j_(e,t)},A1={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},R1=(t={},e=Jh)=>{let[n,r]=B.useState(Jt[e]||M_),i=B.useRef(Jt[e]);B.useEffect(()=>(i.current!==Jt[e]&&r(Jt[e]),Wa.push([e,r]),()=>{let o=Wa.findIndex(([l])=>l===e);o>-1&&Wa.splice(o,1)}),[e]);let s=n.toasts.map(o=>{var l,u,d;return{...t,...t[o.type],...o,removeDelay:o.removeDelay||((l=t[o.type])==null?void 0:l.removeDelay)||(t==null?void 0:t.removeDelay),duration:o.duration||((u=t[o.type])==null?void 0:u.duration)||(t==null?void 0:t.duration)||A1[o.type],style:{...t.style,...(d=t[o.type])==null?void 0:d.style,...o.style}}});return{...n,toasts:s}},k1=(t,e="blank",n)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:e,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...n,id:(n==null?void 0:n.id)||T1()}),Co=t=>(e,n)=>{let r=k1(e,t,n);return su(r.toasterId||S1(r.id))({type:2,toast:r}),r.id},De=(t,e)=>Co("blank")(t,e);De.error=Co("error");De.success=Co("success");De.loading=Co("loading");De.custom=Co("custom");De.dismiss=(t,e)=>{let n={type:3,toastId:t};e?su(e)(n):F_(n)};De.dismissAll=t=>De.dismiss(void 0,t);De.remove=(t,e)=>{let n={type:4,toastId:t};e?su(e)(n):F_(n)};De.removeAll=t=>De.remove(void 0,t);De.promise=(t,e,n)=>{let r=De.loading(e.loading,{...n,...n==null?void 0:n.loading});return typeof t=="function"&&(t=t()),t.then(i=>{let s=e.success?Sl(e.success,i):void 0;return s?De.success(s,{id:r,...n,...n==null?void 0:n.success}):De.dismiss(r),i}).catch(i=>{let s=e.error?Sl(e.error,i):void 0;s?De.error(s,{id:r,...n,...n==null?void 0:n.error}):De.dismiss(r)}),t};var C1=1e3,P1=(t,e="default")=>{let{toasts:n,pausedAt:r}=R1(t,e),i=B.useRef(new Map).current,s=B.useCallback((m,y=C1)=>{if(i.has(m))return;let R=setTimeout(()=>{i.delete(m),o({type:4,toastId:m})},y);i.set(m,R)},[]);B.useEffect(()=>{if(r)return;let m=Date.now(),y=n.map(R=>{if(R.duration===1/0)return;let C=(R.duration||0)+R.pauseDuration-(m-R.createdAt);if(C<0){R.visible&&De.dismiss(R.id);return}return setTimeout(()=>De.dismiss(R.id,e),C)});return()=>{y.forEach(R=>R&&clearTimeout(R))}},[n,r,e]);let o=B.useCallback(su(e),[e]),l=B.useCallback(()=>{o({type:5,time:Date.now()})},[o]),u=B.useCallback((m,y)=>{o({type:1,toast:{id:m,height:y}})},[o]),d=B.useCallback(()=>{r&&o({type:6,time:Date.now()})},[r,o]),f=B.useCallback((m,y)=>{let{reverseOrder:R=!1,gutter:C=8,defaultPosition:b}=y||{},L=n.filter(S=>(S.position||b)===(m.position||b)&&S.height),w=L.findIndex(S=>S.id===m.id),E=L.filter((S,N)=>N<w&&S.visible).length;return L.filter(S=>S.visible).slice(...R?[E+1]:[0,E]).reduce((S,N)=>S+(N.height||0)+C,0)},[n]);return B.useEffect(()=>{n.forEach(m=>{if(m.dismissed)s(m.id,m.removeDelay);else{let y=i.get(m.id);y&&(clearTimeout(y),i.delete(m.id))}})},[n,s]),{toasts:n,handlers:{updateHeight:u,startPause:l,endPause:d,calculateOffset:f}}},x1=Rn`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,b1=Rn`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,N1=Rn`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,D1=_r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${x1} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${b1} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${N1} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,O1=Rn`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,V1=_r("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${O1} 1s linear infinite;
`,L1=Rn`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,M1=Rn`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,j1=_r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${L1} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${M1} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,F1=_r("div")`
  position: absolute;
`,U1=_r("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,z1=Rn`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,B1=_r("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${z1} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,$1=({toast:t})=>{let{icon:e,type:n,iconTheme:r}=t;return e!==void 0?typeof e=="string"?B.createElement(B1,null,e):e:n==="blank"?null:B.createElement(U1,null,B.createElement(V1,{...r}),n!=="loading"&&B.createElement(F1,null,n==="error"?B.createElement(D1,{...r}):B.createElement(j1,{...r})))},W1=t=>`
0% {transform: translate3d(0,${t*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,q1=t=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${t*-150}%,-1px) scale(.6); opacity:0;}
`,H1="0%{opacity:0;} 100%{opacity:1;}",K1="0%{opacity:1;} 100%{opacity:0;}",G1=_r("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Q1=_r("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Y1=(t,e)=>{let n=t.includes("top")?1:-1,[r,i]=V_()?[H1,K1]:[W1(n),q1(n)];return{animation:e?`${Rn(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${Rn(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},X1=B.memo(({toast:t,position:e,style:n,children:r})=>{let i=t.height?Y1(t.position||e||"top-center",t.visible):{opacity:0},s=B.createElement($1,{toast:t}),o=B.createElement(Q1,{...t.ariaProps},Sl(t.message,t));return B.createElement(G1,{className:t.className,style:{...i,...n,...t.style}},typeof r=="function"?r({icon:s,message:o}):B.createElement(B.Fragment,null,s,o))});w1(B.createElement);var J1=({id:t,className:e,style:n,onHeightUpdate:r,children:i})=>{let s=B.useCallback(o=>{if(o){let l=()=>{let u=o.getBoundingClientRect().height;r(t,u)};l(),new MutationObserver(l).observe(o,{subtree:!0,childList:!0,characterData:!0})}},[t,r]);return B.createElement("div",{ref:s,className:e,style:n},i)},Z1=(t,e)=>{let n=t.includes("top"),r=n?{top:0}:{bottom:0},i=t.includes("center")?{justifyContent:"center"}:t.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:V_()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${e*(n?1:-1)}px)`,...r,...i}},eS=iu`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Ra=16,tS=({reverseOrder:t,position:e="top-center",toastOptions:n,gutter:r,children:i,toasterId:s,containerStyle:o,containerClassName:l})=>{let{toasts:u,handlers:d}=P1(n,s);return B.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:Ra,left:Ra,right:Ra,bottom:Ra,pointerEvents:"none",...o},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},u.map(f=>{let m=f.position||e,y=d.calculateOffset(f,{reverseOrder:t,gutter:r,defaultPosition:e}),R=Z1(m,y);return B.createElement(J1,{id:f.id,key:f.id,onHeightUpdate:d.updateHeight,className:f.visible?eS:"",style:R},f.type==="custom"?Sl(f.message,f):i?i(f):B.createElement(X1,{toast:f,position:m}))}))},ne=De,ng={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U_=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},nS=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},z_={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,u=i+2<t.length,d=u?t[i+2]:0,f=s>>2,m=(s&3)<<4|l>>4;let y=(l&15)<<2|d>>6,R=d&63;u||(R=64,o||(y=64)),r.push(n[f],n[m],n[y],n[R])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(U_(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):nS(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const d=i<t.length?n[t.charAt(i)]:64;++i;const m=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||d==null||m==null)throw new rS;const y=s<<2|l>>4;if(r.push(y),d!==64){const R=l<<4&240|d>>2;if(r.push(R),m!==64){const C=d<<6&192|m;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class rS extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const iS=function(t){const e=U_(t);return z_.encodeByteArray(e,!0)},Al=function(t){return iS(t).replace(/\./g,"")},B_=function(t){try{return z_.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sS(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oS=()=>sS().__FIREBASE_DEFAULTS__,aS=()=>{if(typeof process>"u"||typeof ng>"u")return;const t=ng.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},lS=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&B_(t[1]);return e&&JSON.parse(e)},ou=()=>{try{return oS()||aS()||lS()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},$_=t=>{var e,n;return(n=(e=ou())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},uS=t=>{const e=$_(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},W_=()=>{var t;return(t=ou())===null||t===void 0?void 0:t.config},q_=t=>{var e;return(e=ou())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cS{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dS(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",i=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},t);return[Al(JSON.stringify(n)),Al(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function st(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function hS(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(st())}function fS(){var t;const e=(t=ou())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function pS(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function mS(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function gS(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function yS(){const t=st();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function vS(){return!fS()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function _S(){try{return typeof indexedDB=="object"}catch{return!1}}function wS(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ES="FirebaseError";class Nn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=ES,Object.setPrototypeOf(this,Nn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Po.prototype.create)}}class Po{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?TS(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new Nn(i,l,r)}}function TS(t,e){return t.replace(IS,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const IS=/\{\$([^}]+)}/g;function SS(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Rl(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(rg(s)&&rg(o)){if(!Rl(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function rg(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xo(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function xs(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function bs(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function AS(t,e){const n=new RS(t,e);return n.subscribe.bind(n)}class RS{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");kS(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=Ac),i.error===void 0&&(i.error=Ac),i.complete===void 0&&(i.complete=Ac);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function kS(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Ac(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function be(t){return t&&t._delegate?t._delegate:t}class Br{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pr="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CS{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new cS;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(xS(e))try{this.getOrInitializeService({instanceIdentifier:Pr})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Pr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Pr){return this.instances.has(e)}getOptions(e=Pr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){var r;const i=this.normalizeInstanceIdentifier(n),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:PS(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Pr){return this.component?this.component.multipleInstances?e:Pr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function PS(t){return t===Pr?void 0:t}function xS(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bS{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new CS(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var re;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(re||(re={}));const NS={debug:re.DEBUG,verbose:re.VERBOSE,info:re.INFO,warn:re.WARN,error:re.ERROR,silent:re.SILENT},DS=re.INFO,OS={[re.DEBUG]:"log",[re.VERBOSE]:"log",[re.INFO]:"info",[re.WARN]:"warn",[re.ERROR]:"error"},VS=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=OS[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Zh{constructor(e){this.name=e,this._logLevel=DS,this._logHandler=VS,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in re))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?NS[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,re.DEBUG,...e),this._logHandler(this,re.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,re.VERBOSE,...e),this._logHandler(this,re.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,re.INFO,...e),this._logHandler(this,re.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,re.WARN,...e),this._logHandler(this,re.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,re.ERROR,...e),this._logHandler(this,re.ERROR,...e)}}const LS=(t,e)=>e.some(n=>t instanceof n);let ig,sg;function MS(){return ig||(ig=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function jS(){return sg||(sg=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const H_=new WeakMap,bd=new WeakMap,K_=new WeakMap,Rc=new WeakMap,ef=new WeakMap;function FS(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(sr(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&H_.set(n,t)}).catch(()=>{}),ef.set(e,t),e}function US(t){if(bd.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});bd.set(t,e)}let Nd={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return bd.get(t);if(e==="objectStoreNames")return t.objectStoreNames||K_.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return sr(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function zS(t){Nd=t(Nd)}function BS(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(kc(this),e,...n);return K_.set(r,e.sort?e.sort():[e]),sr(r)}:jS().includes(t)?function(...e){return t.apply(kc(this),e),sr(H_.get(this))}:function(...e){return sr(t.apply(kc(this),e))}}function $S(t){return typeof t=="function"?BS(t):(t instanceof IDBTransaction&&US(t),LS(t,MS())?new Proxy(t,Nd):t)}function sr(t){if(t instanceof IDBRequest)return FS(t);if(Rc.has(t))return Rc.get(t);const e=$S(t);return e!==t&&(Rc.set(t,e),ef.set(e,t)),e}const kc=t=>ef.get(t);function WS(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),l=sr(o);return r&&o.addEventListener("upgradeneeded",u=>{r(sr(o.result),u.oldVersion,u.newVersion,sr(o.transaction),u)}),n&&o.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),l}const qS=["get","getKey","getAll","getAllKeys","count"],HS=["put","add","delete","clear"],Cc=new Map;function og(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Cc.get(e))return Cc.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=HS.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||qS.includes(n)))return;const s=async function(o,...l){const u=this.transaction(o,i?"readwrite":"readonly");let d=u.store;return r&&(d=d.index(l.shift())),(await Promise.all([d[n](...l),i&&u.done]))[0]};return Cc.set(e,s),s}zS(t=>({...t,get:(e,n,r)=>og(e,n)||t.get(e,n,r),has:(e,n)=>!!og(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KS{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(GS(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function GS(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Dd="@firebase/app",ag="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kn=new Zh("@firebase/app"),QS="@firebase/app-compat",YS="@firebase/analytics-compat",XS="@firebase/analytics",JS="@firebase/app-check-compat",ZS="@firebase/app-check",eA="@firebase/auth",tA="@firebase/auth-compat",nA="@firebase/database",rA="@firebase/data-connect",iA="@firebase/database-compat",sA="@firebase/functions",oA="@firebase/functions-compat",aA="@firebase/installations",lA="@firebase/installations-compat",uA="@firebase/messaging",cA="@firebase/messaging-compat",dA="@firebase/performance",hA="@firebase/performance-compat",fA="@firebase/remote-config",pA="@firebase/remote-config-compat",mA="@firebase/storage",gA="@firebase/storage-compat",yA="@firebase/firestore",vA="@firebase/vertexai-preview",_A="@firebase/firestore-compat",wA="firebase",EA="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Od="[DEFAULT]",TA={[Dd]:"fire-core",[QS]:"fire-core-compat",[XS]:"fire-analytics",[YS]:"fire-analytics-compat",[ZS]:"fire-app-check",[JS]:"fire-app-check-compat",[eA]:"fire-auth",[tA]:"fire-auth-compat",[nA]:"fire-rtdb",[rA]:"fire-data-connect",[iA]:"fire-rtdb-compat",[sA]:"fire-fn",[oA]:"fire-fn-compat",[aA]:"fire-iid",[lA]:"fire-iid-compat",[uA]:"fire-fcm",[cA]:"fire-fcm-compat",[dA]:"fire-perf",[hA]:"fire-perf-compat",[fA]:"fire-rc",[pA]:"fire-rc-compat",[mA]:"fire-gcs",[gA]:"fire-gcs-compat",[yA]:"fire-fst",[_A]:"fire-fst-compat",[vA]:"fire-vertex","fire-js":"fire-js",[wA]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kl=new Map,IA=new Map,Vd=new Map;function lg(t,e){try{t.container.addComponent(e)}catch(n){kn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ui(t){const e=t.name;if(Vd.has(e))return kn.debug(`There were multiple attempts to register component ${e}.`),!1;Vd.set(e,t);for(const n of kl.values())lg(n,t);for(const n of IA.values())lg(n,t);return!0}function tf(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Zt(t){return t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SA={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},or=new Po("app","Firebase",SA);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AA{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Br("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw or.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ji=EA;function nf(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Od,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw or.create("bad-app-name",{appName:String(i)});if(n||(n=W_()),!n)throw or.create("no-options");const s=kl.get(i);if(s){if(Rl(n,s.options)&&Rl(r,s.config))return s;throw or.create("duplicate-app",{appName:i})}const o=new bS(i);for(const u of Vd.values())o.addComponent(u);const l=new AA(n,r,o);return kl.set(i,l),l}function G_(t=Od){const e=kl.get(t);if(!e&&t===Od&&W_())return nf();if(!e)throw or.create("no-app",{appName:t});return e}function ar(t,e,n){var r;let i=(r=TA[t])!==null&&r!==void 0?r:t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const l=[`Unable to register library "${i}" with version "${e}":`];s&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),kn.warn(l.join(" "));return}Ui(new Br(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RA="firebase-heartbeat-database",kA=1,po="firebase-heartbeat-store";let Pc=null;function Q_(){return Pc||(Pc=WS(RA,kA,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(po)}catch(n){console.warn(n)}}}}).catch(t=>{throw or.create("idb-open",{originalErrorMessage:t.message})})),Pc}async function CA(t){try{const n=(await Q_()).transaction(po),r=await n.objectStore(po).get(Y_(t));return await n.done,r}catch(e){if(e instanceof Nn)kn.warn(e.message);else{const n=or.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});kn.warn(n.message)}}}async function ug(t,e){try{const r=(await Q_()).transaction(po,"readwrite");await r.objectStore(po).put(e,Y_(t)),await r.done}catch(n){if(n instanceof Nn)kn.warn(n.message);else{const r=or.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});kn.warn(r.message)}}}function Y_(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PA=1024,xA=30*24*60*60*1e3;class bA{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new DA(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=cg();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s)?void 0:(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const l=new Date(o.date).valueOf();return Date.now()-l<=xA}),this._storage.overwrite(this._heartbeatsCache))}catch(r){kn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=cg(),{heartbeatsToSend:r,unsentEntries:i}=NA(this._heartbeatsCache.heartbeats),s=Al(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return kn.warn(n),""}}}function cg(){return new Date().toISOString().substring(0,10)}function NA(t,e=PA){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),dg(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),dg(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class DA{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return _S()?wS().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await CA(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return ug(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return ug(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function dg(t){return Al(JSON.stringify({version:2,heartbeats:t})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function OA(t){Ui(new Br("platform-logger",e=>new KS(e),"PRIVATE")),Ui(new Br("heartbeat",e=>new bA(e),"PRIVATE")),ar(Dd,ag,t),ar(Dd,ag,"esm2017"),ar("fire-js","")}OA("");function rf(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]]);return n}function X_(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const VA=X_,J_=new Po("auth","Firebase",X_());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cl=new Zh("@firebase/auth");function LA(t,...e){Cl.logLevel<=re.WARN&&Cl.warn(`Auth (${Ji}): ${t}`,...e)}function qa(t,...e){Cl.logLevel<=re.ERROR&&Cl.error(`Auth (${Ji}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kt(t,...e){throw sf(t,...e)}function nn(t,...e){return sf(t,...e)}function Z_(t,e,n){const r=Object.assign(Object.assign({},VA()),{[e]:n});return new Po("auth","Firebase",r).create(e,{appName:t.name})}function En(t){return Z_(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function sf(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return J_.create(t,...e)}function Q(t,e,...n){if(!t)throw sf(e,...n)}function yn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw qa(e),new Error(e)}function Cn(t,e){t||yn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ld(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function MA(){return hg()==="http:"||hg()==="https:"}function hg(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jA(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(MA()||mS()||"connection"in navigator)?navigator.onLine:!0}function FA(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bo{constructor(e,n){this.shortDelay=e,this.longDelay=n,Cn(n>e,"Short delay should be less than long delay!"),this.isMobile=hS()||gS()}get(){return jA()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function of(t,e){Cn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class e0{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;yn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;yn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;yn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UA={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zA=new bo(3e4,6e4);function wr(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Dn(t,e,n,r,i={}){return t0(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=xo(Object.assign({key:t.config.apiKey},o)).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const d=Object.assign({method:e,headers:u},s);return pS()||(d.referrerPolicy="no-referrer"),e0.fetch()(n0(t,t.config.apiHost,n,l),d)})}async function t0(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},UA),e);try{const i=new $A(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw ka(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[u,d]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw ka(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw ka(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw ka(t,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Z_(t,f,d);Kt(t,f)}}catch(i){if(i instanceof Nn)throw i;Kt(t,"network-request-failed",{message:String(i)})}}async function No(t,e,n,r,i={}){const s=await Dn(t,e,n,r,i);return"mfaPendingCredential"in s&&Kt(t,"multi-factor-auth-required",{_serverResponse:s}),s}function n0(t,e,n,r){const i=`${e}${n}?${r}`;return t.config.emulator?of(t.config,i):`${t.config.apiScheme}://${i}`}function BA(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class $A{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(nn(this.auth,"network-request-failed")),zA.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function ka(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=nn(t,e,r);return i.customData._tokenResponse=n,i}function fg(t){return t!==void 0&&t.enterprise!==void 0}class WA{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return BA(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}async function qA(t,e){return Dn(t,"GET","/v2/recaptchaConfig",wr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function HA(t,e){return Dn(t,"POST","/v1/accounts:delete",e)}async function r0(t,e){return Dn(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qs(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function KA(t,e=!1){const n=be(t),r=await n.getIdToken(e),i=af(r);Q(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:qs(xc(i.auth_time)),issuedAtTime:qs(xc(i.iat)),expirationTime:qs(xc(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function xc(t){return Number(t)*1e3}function af(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return qa("JWT malformed, contained fewer than 3 sections"),null;try{const i=B_(n);return i?JSON.parse(i):(qa("Failed to decode base64 JWT payload"),null)}catch(i){return qa("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function pg(t){const e=af(t);return Q(e,"internal-error"),Q(typeof e.exp<"u","internal-error"),Q(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zi(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Nn&&GA(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function GA({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QA{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Md{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=qs(this.lastLoginAt),this.creationTime=qs(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pl(t){var e;const n=t.auth,r=await t.getIdToken(),i=await zi(t,r0(n,{idToken:r}));Q(i==null?void 0:i.users.length,n,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?i0(s.providerUserInfo):[],l=XA(t.providerData,o),u=t.isAnonymous,d=!(t.email&&s.passwordHash)&&!(l!=null&&l.length),f=u?d:!1,m={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new Md(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(t,m)}async function YA(t){const e=be(t);await Pl(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function XA(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function i0(t){return t.map(e=>{var{providerId:n}=e,r=rf(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function JA(t,e){const n=await t0(t,{},async()=>{const r=xo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=n0(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",e0.fetch()(o,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function ZA(t,e){return Dn(t,"POST","/v2/accounts:revokeToken",wr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pi{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){Q(e.idToken,"internal-error"),Q(typeof e.idToken<"u","internal-error"),Q(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):pg(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){Q(e.length!==0,"internal-error");const n=pg(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(Q(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await JA(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new Pi;return r&&(Q(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(Q(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(Q(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Pi,this.toJSON())}_performRefresh(){return yn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jn(t,e){Q(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class vn{constructor(e){var{uid:n,auth:r,stsTokenManager:i}=e,s=rf(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new QA(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Md(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await zi(this,this.stsTokenManager.getToken(this.auth,e));return Q(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return KA(this,e)}reload(){return YA(this)}_assign(e){this!==e&&(Q(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new vn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){Q(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Pl(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Zt(this.auth.app))return Promise.reject(En(this.auth));const e=await this.getIdToken();return await zi(this,HA(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,i,s,o,l,u,d,f;const m=(r=n.displayName)!==null&&r!==void 0?r:void 0,y=(i=n.email)!==null&&i!==void 0?i:void 0,R=(s=n.phoneNumber)!==null&&s!==void 0?s:void 0,C=(o=n.photoURL)!==null&&o!==void 0?o:void 0,b=(l=n.tenantId)!==null&&l!==void 0?l:void 0,L=(u=n._redirectEventId)!==null&&u!==void 0?u:void 0,w=(d=n.createdAt)!==null&&d!==void 0?d:void 0,E=(f=n.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:S,emailVerified:N,isAnonymous:V,providerData:j,stsTokenManager:g}=n;Q(S&&g,e,"internal-error");const _=Pi.fromJSON(this.name,g);Q(typeof S=="string",e,"internal-error"),jn(m,e.name),jn(y,e.name),Q(typeof N=="boolean",e,"internal-error"),Q(typeof V=="boolean",e,"internal-error"),jn(R,e.name),jn(C,e.name),jn(b,e.name),jn(L,e.name),jn(w,e.name),jn(E,e.name);const T=new vn({uid:S,auth:e,email:y,emailVerified:N,displayName:m,isAnonymous:V,photoURL:C,phoneNumber:R,tenantId:b,stsTokenManager:_,createdAt:w,lastLoginAt:E});return j&&Array.isArray(j)&&(T.providerData=j.map(I=>Object.assign({},I))),L&&(T._redirectEventId=L),T}static async _fromIdTokenResponse(e,n,r=!1){const i=new Pi;i.updateFromServerResponse(n);const s=new vn({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Pl(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];Q(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?i0(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new Pi;l.updateFromIdToken(r);const u=new vn({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Md(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,d),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mg=new Map;function _n(t){Cn(t instanceof Function,"Expected a class definition");let e=mg.get(t);return e?(Cn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,mg.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class s0{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}s0.type="NONE";const gg=s0;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ha(t,e,n){return`firebase:${t}:${e}:${n}`}class xi{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Ha(this.userKey,i.apiKey,s),this.fullPersistenceKey=Ha("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?vn._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new xi(_n(gg),e,r);const i=(await Promise.all(n.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let s=i[0]||_n(gg);const o=Ha(r,e.config.apiKey,e.name);let l=null;for(const d of n)try{const f=await d._get(o);if(f){const m=vn._fromJSON(e,f);d!==s&&(l=m),s=d;break}}catch{}const u=i.filter(d=>d._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new xi(s,e,r):(s=u[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async d=>{if(d!==s)try{await d._remove(o)}catch{}})),new xi(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yg(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(u0(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(o0(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(d0(e))return"Blackberry";if(h0(e))return"Webos";if(a0(e))return"Safari";if((e.includes("chrome/")||l0(e))&&!e.includes("edge/"))return"Chrome";if(c0(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function o0(t=st()){return/firefox\//i.test(t)}function a0(t=st()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function l0(t=st()){return/crios\//i.test(t)}function u0(t=st()){return/iemobile/i.test(t)}function c0(t=st()){return/android/i.test(t)}function d0(t=st()){return/blackberry/i.test(t)}function h0(t=st()){return/webos/i.test(t)}function lf(t=st()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function eR(t=st()){var e;return lf(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function tR(){return yS()&&document.documentMode===10}function f0(t=st()){return lf(t)||c0(t)||h0(t)||d0(t)||/windows phone/i.test(t)||u0(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function p0(t,e=[]){let n;switch(t){case"Browser":n=yg(st());break;case"Worker":n=`${yg(st())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Ji}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nR{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const u=e(s);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rR(t,e={}){return Dn(t,"GET","/v2/passwordPolicy",wr(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iR=6;class sR{constructor(e){var n,r,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:iR,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,i,s,o,l;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(n=u.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(l=u.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),u}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oR{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new vg(this),this.idTokenSubscription=new vg(this),this.beforeStateQueue=new nR(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=J_,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=_n(n)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await xi.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await r0(this,{idToken:e}),r=await vn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Zt(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return Q(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Pl(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=FA()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Zt(this.app))return Promise.reject(En(this));const n=e?be(e):null;return n&&Q(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&Q(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Zt(this.app)?Promise.reject(En(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Zt(this.app)?Promise.reject(En(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(_n(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await rR(this),n=new sR(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Po("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await ZA(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&_n(e)||this._popupRedirectResolver;Q(n,this,"argument-error"),this.redirectPersistenceManager=await xi.create(this,[_n(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(Q(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return Q(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=p0(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(n["X-Firebase-AppCheck"]=i),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&LA(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Xr(t){return be(t)}class vg{constructor(e){this.auth=e,this.observer=null,this.addObserver=AS(n=>this.observer=n)}get next(){return Q(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let au={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function aR(t){au=t}function m0(t){return au.loadJS(t)}function lR(){return au.recaptchaEnterpriseScript}function uR(){return au.gapiScript}function cR(t){return`__${t}${Math.floor(Math.random()*1e6)}`}const dR="recaptcha-enterprise",hR="NO_RECAPTCHA";class fR{constructor(e){this.type=dR,this.auth=Xr(e)}async verify(e="verify",n=!1){async function r(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,l)=>{qA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const d=new WA(u);return s.tenantId==null?s._agentRecaptchaConfig=d:s._tenantRecaptchaConfigs[s.tenantId]=d,o(d.siteKey)}}).catch(u=>{l(u)})})}function i(s,o,l){const u=window.grecaptcha;fg(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(d=>{o(d)}).catch(()=>{o(hR)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((s,o)=>{r(this.auth).then(l=>{if(!n&&fg(window.grecaptcha))i(l,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=lR();u.length!==0&&(u+=l),m0(u).then(()=>{i(l,s,o)}).catch(d=>{o(d)})}}).catch(l=>{o(l)})})}}async function _g(t,e,n,r=!1){const i=new fR(t);let s;try{s=await i.verify(n)}catch{s=await i.verify(n,!0)}const o=Object.assign({},e);return r?Object.assign(o,{captchaResp:s}):Object.assign(o,{captchaResponse:s}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function jd(t,e,n,r){var i;if(!((i=t._getRecaptchaConfig())===null||i===void 0)&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const s=await _g(t,e,n,n==="getOobCode");return r(t,s)}else return r(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await _g(t,e,n,n==="getOobCode");return r(t,o)}else return Promise.reject(s)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pR(t,e){const n=tf(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(Rl(s,e??{}))return i;Kt(i,"already-initialized")}return n.initialize({options:e})}function mR(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(_n);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function gR(t,e,n){const r=Xr(t);Q(r._canInitEmulator,r,"emulator-config-failed"),Q(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=g0(e),{host:o,port:l}=yR(e),u=l===null?"":`:${l}`;r.config.emulator={url:`${s}//${o}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})}),vR()}function g0(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function yR(t){const e=g0(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:wg(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:wg(o)}}}function wg(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function vR(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uf{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return yn("not implemented")}_getIdTokenResponse(e){return yn("not implemented")}_linkToIdToken(e,n){return yn("not implemented")}_getReauthenticationResolver(e){return yn("not implemented")}}async function _R(t,e){return Dn(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wR(t,e){return No(t,"POST","/v1/accounts:signInWithPassword",wr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ER(t,e){return No(t,"POST","/v1/accounts:signInWithEmailLink",wr(t,e))}async function TR(t,e){return No(t,"POST","/v1/accounts:signInWithEmailLink",wr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo extends uf{constructor(e,n,r,i=null){super("password",r),this._email=e,this._password=n,this._tenantId=i}static _fromEmailAndPassword(e,n){return new mo(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new mo(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return jd(e,n,"signInWithPassword",wR);case"emailLink":return ER(e,{email:this._email,oobCode:this._password});default:Kt(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return jd(e,r,"signUpPassword",_R);case"emailLink":return TR(e,{idToken:n,email:this._email,oobCode:this._password});default:Kt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bi(t,e){return No(t,"POST","/v1/accounts:signInWithIdp",wr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IR="http://localhost";class $r extends uf{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new $r(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Kt("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=n,s=rf(n,["providerId","signInMethod"]);if(!r||!i)return null;const o=new $r(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return bi(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,bi(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,bi(e,n)}buildRequest(){const e={requestUri:IR,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=xo(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SR(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function AR(t){const e=xs(bs(t)).link,n=e?xs(bs(e)).deep_link_id:null,r=xs(bs(t)).deep_link_id;return(r?xs(bs(r)).link:null)||r||n||e||t}class cf{constructor(e){var n,r,i,s,o,l;const u=xs(bs(e)),d=(n=u.apiKey)!==null&&n!==void 0?n:null,f=(r=u.oobCode)!==null&&r!==void 0?r:null,m=SR((i=u.mode)!==null&&i!==void 0?i:null);Q(d&&f&&m,"argument-error"),this.apiKey=d,this.operation=m,this.code=f,this.continueUrl=(s=u.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=u.languageCode)!==null&&o!==void 0?o:null,this.tenantId=(l=u.tenantId)!==null&&l!==void 0?l:null}static parseLink(e){const n=AR(e);try{return new cf(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(){this.providerId=Zi.PROVIDER_ID}static credential(e,n){return mo._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=cf.parseLink(n);return Q(r,"argument-error"),mo._fromEmailAndCode(e,r.code,r.tenantId)}}Zi.PROVIDER_ID="password";Zi.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Zi.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y0{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do extends y0{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wn extends Do{constructor(){super("facebook.com")}static credential(e){return $r._fromParams({providerId:Wn.PROVIDER_ID,signInMethod:Wn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Wn.credentialFromTaggedObject(e)}static credentialFromError(e){return Wn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Wn.credential(e.oauthAccessToken)}catch{return null}}}Wn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Wn.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn extends Do{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return $r._fromParams({providerId:qn.PROVIDER_ID,signInMethod:qn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return qn.credentialFromTaggedObject(e)}static credentialFromError(e){return qn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return qn.credential(n,r)}catch{return null}}}qn.GOOGLE_SIGN_IN_METHOD="google.com";qn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hn extends Do{constructor(){super("github.com")}static credential(e){return $r._fromParams({providerId:Hn.PROVIDER_ID,signInMethod:Hn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Hn.credentialFromTaggedObject(e)}static credentialFromError(e){return Hn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Hn.credential(e.oauthAccessToken)}catch{return null}}}Hn.GITHUB_SIGN_IN_METHOD="github.com";Hn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kn extends Do{constructor(){super("twitter.com")}static credential(e,n){return $r._fromParams({providerId:Kn.PROVIDER_ID,signInMethod:Kn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return Kn.credentialFromTaggedObject(e)}static credentialFromError(e){return Kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return Kn.credential(n,r)}catch{return null}}}Kn.TWITTER_SIGN_IN_METHOD="twitter.com";Kn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function RR(t,e){return No(t,"POST","/v1/accounts:signUp",wr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wr{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await vn._fromIdTokenResponse(e,r,i),o=Eg(r);return new Wr({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=Eg(r);return new Wr({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function Eg(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xl extends Nn{constructor(e,n,r,i){var s;super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,xl.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new xl(e,n,r,i)}}function v0(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?xl._fromErrorAndOperation(t,s,e,r):s})}async function kR(t,e,n=!1){const r=await zi(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Wr._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function CR(t,e,n=!1){const{auth:r}=t;if(Zt(r.app))return Promise.reject(En(r));const i="reauthenticate";try{const s=await zi(t,v0(r,i,e,t),n);Q(s.idToken,r,"internal-error");const o=af(s.idToken);Q(o,r,"internal-error");const{sub:l}=o;return Q(t.uid===l,r,"user-mismatch"),Wr._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&Kt(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _0(t,e,n=!1){if(Zt(t.app))return Promise.reject(En(t));const r="signIn",i=await v0(t,r,e),s=await Wr._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}async function PR(t,e){return _0(Xr(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function w0(t){const e=Xr(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function E0(t,e,n){if(Zt(t.app))return Promise.reject(En(t));const r=Xr(t),o=await jd(r,{returnSecureToken:!0,email:e,password:n,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",RR).catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&w0(t),u}),l=await Wr._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(l.user),l}function xR(t,e,n){return Zt(t.app)?Promise.reject(En(t)):PR(be(t),Zi.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&w0(t),r})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bR(t,e){return Dn(t,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function NR(t,{displayName:e,photoURL:n}){if(e===void 0&&n===void 0)return;const r=be(t),s={idToken:await r.getIdToken(),displayName:e,photoUrl:n,returnSecureToken:!0},o=await zi(r,bR(r.auth,s));r.displayName=o.displayName||null,r.photoURL=o.photoUrl||null;const l=r.providerData.find(({providerId:u})=>u==="password");l&&(l.displayName=r.displayName,l.photoURL=r.photoURL),await r._updateTokensIfNecessary(o)}function DR(t,e,n,r){return be(t).onIdTokenChanged(e,n,r)}function OR(t,e,n){return be(t).beforeAuthStateChanged(e,n)}function VR(t,e,n,r){return be(t).onAuthStateChanged(e,n,r)}function T0(t){return be(t).signOut()}const bl="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I0{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(bl,"1"),this.storage.removeItem(bl),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LR=1e3,MR=10;class S0 extends I0{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=f0(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);tR()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,MR):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},LR)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}S0.type="LOCAL";const jR=S0;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A0 extends I0{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}A0.type="SESSION";const R0=A0;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FR(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lu{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new lu(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async d=>d(n.origin,s)),u=await FR(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}lu.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function df(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UR{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,u)=>{const d=df("",20);i.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(m){const y=m;if(y.data.eventId===d)switch(y.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(y.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:d,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rn(){return window}function zR(t){rn().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k0(){return typeof rn().WorkerGlobalScope<"u"&&typeof rn().importScripts=="function"}async function BR(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function $R(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function WR(){return k0()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C0="firebaseLocalStorageDb",qR=1,Nl="firebaseLocalStorage",P0="fbase_key";class Oo{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function uu(t,e){return t.transaction([Nl],e?"readwrite":"readonly").objectStore(Nl)}function HR(){const t=indexedDB.deleteDatabase(C0);return new Oo(t).toPromise()}function Fd(){const t=indexedDB.open(C0,qR);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Nl,{keyPath:P0})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Nl)?e(r):(r.close(),await HR(),e(await Fd()))})})}async function Tg(t,e,n){const r=uu(t,!0).put({[P0]:e,value:n});return new Oo(r).toPromise()}async function KR(t,e){const n=uu(t,!1).get(e),r=await new Oo(n).toPromise();return r===void 0?null:r.value}function Ig(t,e){const n=uu(t,!0).delete(e);return new Oo(n).toPromise()}const GR=800,QR=3;class x0{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Fd(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>QR)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return k0()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=lu._getInstance(WR()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await BR(),!this.activeServiceWorker)return;this.sender=new UR(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||$R()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Fd();return await Tg(e,bl,"1"),await Ig(e,bl),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>Tg(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>KR(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>Ig(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=uu(i,!1).getAll();return new Oo(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),GR)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}x0.type="LOCAL";const YR=x0;new bo(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function XR(t,e){return e?_n(e):(Q(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hf extends uf{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return bi(e,this._buildIdpRequest())}_linkToIdToken(e,n){return bi(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return bi(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function JR(t){return _0(t.auth,new hf(t),t.bypassAuthState)}function ZR(t){const{auth:e,user:n}=t;return Q(n,e,"internal-error"),CR(n,new hf(t),t.bypassAuthState)}async function ek(t){const{auth:e,user:n}=t;return Q(n,e,"internal-error"),kR(n,new hf(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b0{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return JR;case"linkViaPopup":case"linkViaRedirect":return ek;case"reauthViaPopup":case"reauthViaRedirect":return ZR;default:Kt(this.auth,"internal-error")}}resolve(e){Cn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Cn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tk=new bo(2e3,1e4);class Ti extends b0{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Ti.currentPopupAction&&Ti.currentPopupAction.cancel(),Ti.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return Q(e,this.auth,"internal-error"),e}async onExecution(){Cn(this.filter.length===1,"Popup operations only handle one event");const e=df();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(nn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(nn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ti.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(nn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,tk.get())};e()}}Ti.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nk="pendingRedirect",Ka=new Map;class rk extends b0{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Ka.get(this.auth._key());if(!e){try{const r=await ik(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Ka.set(this.auth._key(),e)}return this.bypassAuthState||Ka.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ik(t,e){const n=ak(e),r=ok(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function sk(t,e){Ka.set(t._key(),e)}function ok(t){return _n(t._redirectPersistence)}function ak(t){return Ha(nk,t.config.apiKey,t.name)}async function lk(t,e,n=!1){if(Zt(t.app))return Promise.reject(En(t));const r=Xr(t),i=XR(r,e),o=await new rk(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uk=10*60*1e3;class ck{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!dk(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!N0(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(nn(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=uk&&this.cachedEventUids.clear(),this.cachedEventUids.has(Sg(e))}saveEventToCache(e){this.cachedEventUids.add(Sg(e)),this.lastProcessedEventTime=Date.now()}}function Sg(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function N0({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function dk(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return N0(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hk(t,e={}){return Dn(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fk=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,pk=/^https?/;async function mk(t){if(t.config.emulator)return;const{authorizedDomains:e}=await hk(t);for(const n of e)try{if(gk(n))return}catch{}Kt(t,"unauthorized-domain")}function gk(t){const e=Ld(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!pk.test(n))return!1;if(fk.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yk=new bo(3e4,6e4);function Ag(){const t=rn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function vk(t){return new Promise((e,n)=>{var r,i,s;function o(){Ag(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Ag(),n(nn(t,"network-request-failed"))},timeout:yk.get()})}if(!((i=(r=rn().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=rn().gapi)===null||s===void 0)&&s.load)o();else{const l=cR("iframefcb");return rn()[l]=()=>{gapi.load?o():n(nn(t,"network-request-failed"))},m0(`${uR()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw Ga=null,e})}let Ga=null;function _k(t){return Ga=Ga||vk(t),Ga}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wk=new bo(5e3,15e3),Ek="__/auth/iframe",Tk="emulator/auth/iframe",Ik={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Sk=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Ak(t){const e=t.config;Q(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?of(e,Tk):`https://${t.config.authDomain}/${Ek}`,r={apiKey:e.apiKey,appName:t.name,v:Ji},i=Sk.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${xo(r).slice(1)}`}async function Rk(t){const e=await _k(t),n=rn().gapi;return Q(n,t,"internal-error"),e.open({where:document.body,url:Ak(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Ik,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=nn(t,"network-request-failed"),l=rn().setTimeout(()=>{s(o)},wk.get());function u(){rn().clearTimeout(l),i(r)}r.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kk={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Ck=500,Pk=600,xk="_blank",bk="http://localhost";class Rg{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Nk(t,e,n,r=Ck,i=Pk){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u=Object.assign(Object.assign({},kk),{width:r.toString(),height:i.toString(),top:s,left:o}),d=st().toLowerCase();n&&(l=l0(d)?xk:n),o0(d)&&(e=e||bk,u.scrollbars="yes");const f=Object.entries(u).reduce((y,[R,C])=>`${y}${R}=${C},`,"");if(eR(d)&&l!=="_self")return Dk(e||"",l),new Rg(null);const m=window.open(e||"",l,f);Q(m,t,"popup-blocked");try{m.focus()}catch{}return new Rg(m)}function Dk(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ok="__/auth/handler",Vk="emulator/auth/handler",Lk=encodeURIComponent("fac");async function kg(t,e,n,r,i,s){Q(t.config.authDomain,t,"auth-domain-config-required"),Q(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:Ji,eventId:i};if(e instanceof y0){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",SS(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))o[f]=m}if(e instanceof Do){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(o.scopes=f.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const u=await t._getAppCheckToken(),d=u?`#${Lk}=${encodeURIComponent(u)}`:"";return`${Mk(t)}?${xo(l).slice(1)}${d}`}function Mk({config:t}){return t.emulator?of(t,Vk):`https://${t.authDomain}/${Ok}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bc="webStorageSupport";class jk{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=R0,this._completeRedirectFn=lk,this._overrideRedirectResult=sk}async _openPopup(e,n,r,i){var s;Cn((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await kg(e,n,r,Ld(),i);return Nk(e,o,df())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await kg(e,n,r,Ld(),i);return zR(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(Cn(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Rk(e),r=new ck(e);return n.register("authEvent",i=>(Q(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(bc,{type:bc},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[bc];o!==void 0&&n(!!o),Kt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=mk(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return f0()||a0()||lf()}}const Fk=jk;var Cg="@firebase/auth",Pg="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uk{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){Q(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zk(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Bk(t){Ui(new Br("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;Q(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:p0(t)},d=new oR(r,i,s,u);return mR(d,n),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),Ui(new Br("auth-internal",e=>{const n=Xr(e.getProvider("auth").getImmediate());return(r=>new Uk(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),ar(Cg,Pg,zk(t)),ar(Cg,Pg,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $k=5*60,Wk=q_("authIdTokenMaxAge")||$k;let xg=null;const qk=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>Wk)return;const i=n==null?void 0:n.token;xg!==i&&(xg=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function D0(t=G_()){const e=tf(t,"auth");if(e.isInitialized())return e.getImmediate();const n=pR(t,{popupRedirectResolver:Fk,persistence:[YR,jR,R0]}),r=q_("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=qk(s.toString());OR(n,o,()=>o(n.currentUser)),DR(n,l=>o(l))}}const i=$_("auth");return i&&gR(n,`http://${i}`),n}function Hk(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}aR({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=nn("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",Hk().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Bk("Browser");var bg=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Lr,O0;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(g,_){function T(){}T.prototype=_.prototype,g.D=_.prototype,g.prototype=new T,g.prototype.constructor=g,g.C=function(I,k,P){for(var A=Array(arguments.length-2),ke=2;ke<arguments.length;ke++)A[ke-2]=arguments[ke];return _.prototype[k].apply(I,A)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(g,_,T){T||(T=0);var I=Array(16);if(typeof _=="string")for(var k=0;16>k;++k)I[k]=_.charCodeAt(T++)|_.charCodeAt(T++)<<8|_.charCodeAt(T++)<<16|_.charCodeAt(T++)<<24;else for(k=0;16>k;++k)I[k]=_[T++]|_[T++]<<8|_[T++]<<16|_[T++]<<24;_=g.g[0],T=g.g[1],k=g.g[2];var P=g.g[3],A=_+(P^T&(k^P))+I[0]+3614090360&4294967295;_=T+(A<<7&4294967295|A>>>25),A=P+(k^_&(T^k))+I[1]+3905402710&4294967295,P=_+(A<<12&4294967295|A>>>20),A=k+(T^P&(_^T))+I[2]+606105819&4294967295,k=P+(A<<17&4294967295|A>>>15),A=T+(_^k&(P^_))+I[3]+3250441966&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(P^T&(k^P))+I[4]+4118548399&4294967295,_=T+(A<<7&4294967295|A>>>25),A=P+(k^_&(T^k))+I[5]+1200080426&4294967295,P=_+(A<<12&4294967295|A>>>20),A=k+(T^P&(_^T))+I[6]+2821735955&4294967295,k=P+(A<<17&4294967295|A>>>15),A=T+(_^k&(P^_))+I[7]+4249261313&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(P^T&(k^P))+I[8]+1770035416&4294967295,_=T+(A<<7&4294967295|A>>>25),A=P+(k^_&(T^k))+I[9]+2336552879&4294967295,P=_+(A<<12&4294967295|A>>>20),A=k+(T^P&(_^T))+I[10]+4294925233&4294967295,k=P+(A<<17&4294967295|A>>>15),A=T+(_^k&(P^_))+I[11]+2304563134&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(P^T&(k^P))+I[12]+1804603682&4294967295,_=T+(A<<7&4294967295|A>>>25),A=P+(k^_&(T^k))+I[13]+4254626195&4294967295,P=_+(A<<12&4294967295|A>>>20),A=k+(T^P&(_^T))+I[14]+2792965006&4294967295,k=P+(A<<17&4294967295|A>>>15),A=T+(_^k&(P^_))+I[15]+1236535329&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(k^P&(T^k))+I[1]+4129170786&4294967295,_=T+(A<<5&4294967295|A>>>27),A=P+(T^k&(_^T))+I[6]+3225465664&4294967295,P=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(P^_))+I[11]+643717713&4294967295,k=P+(A<<14&4294967295|A>>>18),A=T+(P^_&(k^P))+I[0]+3921069994&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(k^P&(T^k))+I[5]+3593408605&4294967295,_=T+(A<<5&4294967295|A>>>27),A=P+(T^k&(_^T))+I[10]+38016083&4294967295,P=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(P^_))+I[15]+3634488961&4294967295,k=P+(A<<14&4294967295|A>>>18),A=T+(P^_&(k^P))+I[4]+3889429448&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(k^P&(T^k))+I[9]+568446438&4294967295,_=T+(A<<5&4294967295|A>>>27),A=P+(T^k&(_^T))+I[14]+3275163606&4294967295,P=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(P^_))+I[3]+4107603335&4294967295,k=P+(A<<14&4294967295|A>>>18),A=T+(P^_&(k^P))+I[8]+1163531501&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(k^P&(T^k))+I[13]+2850285829&4294967295,_=T+(A<<5&4294967295|A>>>27),A=P+(T^k&(_^T))+I[2]+4243563512&4294967295,P=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(P^_))+I[7]+1735328473&4294967295,k=P+(A<<14&4294967295|A>>>18),A=T+(P^_&(k^P))+I[12]+2368359562&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(T^k^P)+I[5]+4294588738&4294967295,_=T+(A<<4&4294967295|A>>>28),A=P+(_^T^k)+I[8]+2272392833&4294967295,P=_+(A<<11&4294967295|A>>>21),A=k+(P^_^T)+I[11]+1839030562&4294967295,k=P+(A<<16&4294967295|A>>>16),A=T+(k^P^_)+I[14]+4259657740&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(T^k^P)+I[1]+2763975236&4294967295,_=T+(A<<4&4294967295|A>>>28),A=P+(_^T^k)+I[4]+1272893353&4294967295,P=_+(A<<11&4294967295|A>>>21),A=k+(P^_^T)+I[7]+4139469664&4294967295,k=P+(A<<16&4294967295|A>>>16),A=T+(k^P^_)+I[10]+3200236656&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(T^k^P)+I[13]+681279174&4294967295,_=T+(A<<4&4294967295|A>>>28),A=P+(_^T^k)+I[0]+3936430074&4294967295,P=_+(A<<11&4294967295|A>>>21),A=k+(P^_^T)+I[3]+3572445317&4294967295,k=P+(A<<16&4294967295|A>>>16),A=T+(k^P^_)+I[6]+76029189&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(T^k^P)+I[9]+3654602809&4294967295,_=T+(A<<4&4294967295|A>>>28),A=P+(_^T^k)+I[12]+3873151461&4294967295,P=_+(A<<11&4294967295|A>>>21),A=k+(P^_^T)+I[15]+530742520&4294967295,k=P+(A<<16&4294967295|A>>>16),A=T+(k^P^_)+I[2]+3299628645&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(k^(T|~P))+I[0]+4096336452&4294967295,_=T+(A<<6&4294967295|A>>>26),A=P+(T^(_|~k))+I[7]+1126891415&4294967295,P=_+(A<<10&4294967295|A>>>22),A=k+(_^(P|~T))+I[14]+2878612391&4294967295,k=P+(A<<15&4294967295|A>>>17),A=T+(P^(k|~_))+I[5]+4237533241&4294967295,T=k+(A<<21&4294967295|A>>>11),A=_+(k^(T|~P))+I[12]+1700485571&4294967295,_=T+(A<<6&4294967295|A>>>26),A=P+(T^(_|~k))+I[3]+2399980690&4294967295,P=_+(A<<10&4294967295|A>>>22),A=k+(_^(P|~T))+I[10]+4293915773&4294967295,k=P+(A<<15&4294967295|A>>>17),A=T+(P^(k|~_))+I[1]+2240044497&4294967295,T=k+(A<<21&4294967295|A>>>11),A=_+(k^(T|~P))+I[8]+1873313359&4294967295,_=T+(A<<6&4294967295|A>>>26),A=P+(T^(_|~k))+I[15]+4264355552&4294967295,P=_+(A<<10&4294967295|A>>>22),A=k+(_^(P|~T))+I[6]+2734768916&4294967295,k=P+(A<<15&4294967295|A>>>17),A=T+(P^(k|~_))+I[13]+1309151649&4294967295,T=k+(A<<21&4294967295|A>>>11),A=_+(k^(T|~P))+I[4]+4149444226&4294967295,_=T+(A<<6&4294967295|A>>>26),A=P+(T^(_|~k))+I[11]+3174756917&4294967295,P=_+(A<<10&4294967295|A>>>22),A=k+(_^(P|~T))+I[2]+718787259&4294967295,k=P+(A<<15&4294967295|A>>>17),A=T+(P^(k|~_))+I[9]+3951481745&4294967295,g.g[0]=g.g[0]+_&4294967295,g.g[1]=g.g[1]+(k+(A<<21&4294967295|A>>>11))&4294967295,g.g[2]=g.g[2]+k&4294967295,g.g[3]=g.g[3]+P&4294967295}r.prototype.u=function(g,_){_===void 0&&(_=g.length);for(var T=_-this.blockSize,I=this.B,k=this.h,P=0;P<_;){if(k==0)for(;P<=T;)i(this,g,P),P+=this.blockSize;if(typeof g=="string"){for(;P<_;)if(I[k++]=g.charCodeAt(P++),k==this.blockSize){i(this,I),k=0;break}}else for(;P<_;)if(I[k++]=g[P++],k==this.blockSize){i(this,I),k=0;break}}this.h=k,this.o+=_},r.prototype.v=function(){var g=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);g[0]=128;for(var _=1;_<g.length-8;++_)g[_]=0;var T=8*this.o;for(_=g.length-8;_<g.length;++_)g[_]=T&255,T/=256;for(this.u(g),g=Array(16),_=T=0;4>_;++_)for(var I=0;32>I;I+=8)g[T++]=this.g[_]>>>I&255;return g};function s(g,_){var T=l;return Object.prototype.hasOwnProperty.call(T,g)?T[g]:T[g]=_(g)}function o(g,_){this.h=_;for(var T=[],I=!0,k=g.length-1;0<=k;k--){var P=g[k]|0;I&&P==_||(T[k]=P,I=!1)}this.g=T}var l={};function u(g){return-128<=g&&128>g?s(g,function(_){return new o([_|0],0>_?-1:0)}):new o([g|0],0>g?-1:0)}function d(g){if(isNaN(g)||!isFinite(g))return m;if(0>g)return L(d(-g));for(var _=[],T=1,I=0;g>=T;I++)_[I]=g/T|0,T*=4294967296;return new o(_,0)}function f(g,_){if(g.length==0)throw Error("number format error: empty string");if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(g.charAt(0)=="-")return L(f(g.substring(1),_));if(0<=g.indexOf("-"))throw Error('number format error: interior "-" character');for(var T=d(Math.pow(_,8)),I=m,k=0;k<g.length;k+=8){var P=Math.min(8,g.length-k),A=parseInt(g.substring(k,k+P),_);8>P?(P=d(Math.pow(_,P)),I=I.j(P).add(d(A))):(I=I.j(T),I=I.add(d(A)))}return I}var m=u(0),y=u(1),R=u(16777216);t=o.prototype,t.m=function(){if(b(this))return-L(this).m();for(var g=0,_=1,T=0;T<this.g.length;T++){var I=this.i(T);g+=(0<=I?I:4294967296+I)*_,_*=4294967296}return g},t.toString=function(g){if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(C(this))return"0";if(b(this))return"-"+L(this).toString(g);for(var _=d(Math.pow(g,6)),T=this,I="";;){var k=N(T,_).g;T=w(T,k.j(_));var P=((0<T.g.length?T.g[0]:T.h)>>>0).toString(g);if(T=k,C(T))return P+I;for(;6>P.length;)P="0"+P;I=P+I}},t.i=function(g){return 0>g?0:g<this.g.length?this.g[g]:this.h};function C(g){if(g.h!=0)return!1;for(var _=0;_<g.g.length;_++)if(g.g[_]!=0)return!1;return!0}function b(g){return g.h==-1}t.l=function(g){return g=w(this,g),b(g)?-1:C(g)?0:1};function L(g){for(var _=g.g.length,T=[],I=0;I<_;I++)T[I]=~g.g[I];return new o(T,~g.h).add(y)}t.abs=function(){return b(this)?L(this):this},t.add=function(g){for(var _=Math.max(this.g.length,g.g.length),T=[],I=0,k=0;k<=_;k++){var P=I+(this.i(k)&65535)+(g.i(k)&65535),A=(P>>>16)+(this.i(k)>>>16)+(g.i(k)>>>16);I=A>>>16,P&=65535,A&=65535,T[k]=A<<16|P}return new o(T,T[T.length-1]&-2147483648?-1:0)};function w(g,_){return g.add(L(_))}t.j=function(g){if(C(this)||C(g))return m;if(b(this))return b(g)?L(this).j(L(g)):L(L(this).j(g));if(b(g))return L(this.j(L(g)));if(0>this.l(R)&&0>g.l(R))return d(this.m()*g.m());for(var _=this.g.length+g.g.length,T=[],I=0;I<2*_;I++)T[I]=0;for(I=0;I<this.g.length;I++)for(var k=0;k<g.g.length;k++){var P=this.i(I)>>>16,A=this.i(I)&65535,ke=g.i(k)>>>16,Rt=g.i(k)&65535;T[2*I+2*k]+=A*Rt,E(T,2*I+2*k),T[2*I+2*k+1]+=P*Rt,E(T,2*I+2*k+1),T[2*I+2*k+1]+=A*ke,E(T,2*I+2*k+1),T[2*I+2*k+2]+=P*ke,E(T,2*I+2*k+2)}for(I=0;I<_;I++)T[I]=T[2*I+1]<<16|T[2*I];for(I=_;I<2*_;I++)T[I]=0;return new o(T,0)};function E(g,_){for(;(g[_]&65535)!=g[_];)g[_+1]+=g[_]>>>16,g[_]&=65535,_++}function S(g,_){this.g=g,this.h=_}function N(g,_){if(C(_))throw Error("division by zero");if(C(g))return new S(m,m);if(b(g))return _=N(L(g),_),new S(L(_.g),L(_.h));if(b(_))return _=N(g,L(_)),new S(L(_.g),_.h);if(30<g.g.length){if(b(g)||b(_))throw Error("slowDivide_ only works with positive integers.");for(var T=y,I=_;0>=I.l(g);)T=V(T),I=V(I);var k=j(T,1),P=j(I,1);for(I=j(I,2),T=j(T,2);!C(I);){var A=P.add(I);0>=A.l(g)&&(k=k.add(T),P=A),I=j(I,1),T=j(T,1)}return _=w(g,k.j(_)),new S(k,_)}for(k=m;0<=g.l(_);){for(T=Math.max(1,Math.floor(g.m()/_.m())),I=Math.ceil(Math.log(T)/Math.LN2),I=48>=I?1:Math.pow(2,I-48),P=d(T),A=P.j(_);b(A)||0<A.l(g);)T-=I,P=d(T),A=P.j(_);C(P)&&(P=y),k=k.add(P),g=w(g,A)}return new S(k,g)}t.A=function(g){return N(this,g).h},t.and=function(g){for(var _=Math.max(this.g.length,g.g.length),T=[],I=0;I<_;I++)T[I]=this.i(I)&g.i(I);return new o(T,this.h&g.h)},t.or=function(g){for(var _=Math.max(this.g.length,g.g.length),T=[],I=0;I<_;I++)T[I]=this.i(I)|g.i(I);return new o(T,this.h|g.h)},t.xor=function(g){for(var _=Math.max(this.g.length,g.g.length),T=[],I=0;I<_;I++)T[I]=this.i(I)^g.i(I);return new o(T,this.h^g.h)};function V(g){for(var _=g.g.length+1,T=[],I=0;I<_;I++)T[I]=g.i(I)<<1|g.i(I-1)>>>31;return new o(T,g.h)}function j(g,_){var T=_>>5;_%=32;for(var I=g.g.length-T,k=[],P=0;P<I;P++)k[P]=0<_?g.i(P+T)>>>_|g.i(P+T+1)<<32-_:g.i(P+T);return new o(k,g.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,O0=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=d,o.fromString=f,Lr=o}).apply(typeof bg<"u"?bg:typeof self<"u"?self:typeof window<"u"?window:{});var Ca=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var V0,Ns,L0,Qa,Ud,M0,j0,F0;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,c,h){return a==Array.prototype||a==Object.prototype||(a[c]=h.value),a};function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ca=="object"&&Ca];for(var c=0;c<a.length;++c){var h=a[c];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=n(this);function i(a,c){if(c)e:{var h=r;a=a.split(".");for(var v=0;v<a.length-1;v++){var x=a[v];if(!(x in h))break e;h=h[x]}a=a[a.length-1],v=h[a],c=c(v),c!=v&&c!=null&&e(h,a,{configurable:!0,writable:!0,value:c})}}function s(a,c){a instanceof String&&(a+="");var h=0,v=!1,x={next:function(){if(!v&&h<a.length){var O=h++;return{value:c(O,a[O]),done:!1}}return v=!0,{done:!0,value:void 0}}};return x[Symbol.iterator]=function(){return x},x}i("Array.prototype.values",function(a){return a||function(){return s(this,function(c,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},l=this||self;function u(a){var c=typeof a;return c=c!="object"?c:a?Array.isArray(a)?"array":c:"null",c=="array"||c=="object"&&typeof a.length=="number"}function d(a){var c=typeof a;return c=="object"&&a!=null||c=="function"}function f(a,c,h){return a.call.apply(a.bind,arguments)}function m(a,c,h){if(!a)throw Error();if(2<arguments.length){var v=Array.prototype.slice.call(arguments,2);return function(){var x=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(x,v),a.apply(c,x)}}return function(){return a.apply(c,arguments)}}function y(a,c,h){return y=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,y.apply(null,arguments)}function R(a,c){var h=Array.prototype.slice.call(arguments,1);return function(){var v=h.slice();return v.push.apply(v,arguments),a.apply(this,v)}}function C(a,c){function h(){}h.prototype=c.prototype,a.aa=c.prototype,a.prototype=new h,a.prototype.constructor=a,a.Qb=function(v,x,O){for(var z=Array(arguments.length-2),he=2;he<arguments.length;he++)z[he-2]=arguments[he];return c.prototype[x].apply(v,z)}}function b(a){const c=a.length;if(0<c){const h=Array(c);for(let v=0;v<c;v++)h[v]=a[v];return h}return[]}function L(a,c){for(let h=1;h<arguments.length;h++){const v=arguments[h];if(u(v)){const x=a.length||0,O=v.length||0;a.length=x+O;for(let z=0;z<O;z++)a[x+z]=v[z]}else a.push(v)}}class w{constructor(c,h){this.i=c,this.j=h,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function E(a){return/^[\s\xa0]*$/.test(a)}function S(){var a=l.navigator;return a&&(a=a.userAgent)?a:""}function N(a){return N[" "](a),a}N[" "]=function(){};var V=S().indexOf("Gecko")!=-1&&!(S().toLowerCase().indexOf("webkit")!=-1&&S().indexOf("Edge")==-1)&&!(S().indexOf("Trident")!=-1||S().indexOf("MSIE")!=-1)&&S().indexOf("Edge")==-1;function j(a,c,h){for(const v in a)c.call(h,a[v],v,a)}function g(a,c){for(const h in a)c.call(void 0,a[h],h,a)}function _(a){const c={};for(const h in a)c[h]=a[h];return c}const T="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function I(a,c){let h,v;for(let x=1;x<arguments.length;x++){v=arguments[x];for(h in v)a[h]=v[h];for(let O=0;O<T.length;O++)h=T[O],Object.prototype.hasOwnProperty.call(v,h)&&(a[h]=v[h])}}function k(a){var c=1;a=a.split(":");const h=[];for(;0<c&&a.length;)h.push(a.shift()),c--;return a.length&&h.push(a.join(":")),h}function P(a){l.setTimeout(()=>{throw a},0)}function A(){var a=D;let c=null;return a.g&&(c=a.g,a.g=a.g.next,a.g||(a.h=null),c.next=null),c}class ke{constructor(){this.h=this.g=null}add(c,h){const v=Rt.get();v.set(c,h),this.h?this.h.next=v:this.g=v,this.h=v}}var Rt=new w(()=>new Tr,a=>a.reset());class Tr{constructor(){this.next=this.g=this.h=null}set(c,h){this.h=c,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let kt,$=!1,D=new ke,K=()=>{const a=l.Promise.resolve(void 0);kt=()=>{a.then(le)}};var le=()=>{for(var a;a=A();){try{a.h.call(a.g)}catch(h){P(h)}var c=Rt;c.j(a),100>c.h&&(c.h++,a.next=c.g,c.g=a)}$=!1};function Z(){this.s=this.s,this.C=this.C}Z.prototype.s=!1,Z.prototype.ma=function(){this.s||(this.s=!0,this.N())},Z.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function ue(a,c){this.type=a,this.g=this.target=c,this.defaultPrevented=!1}ue.prototype.h=function(){this.defaultPrevented=!0};var Ct=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var a=!1,c=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const h=()=>{};l.addEventListener("test",h,c),l.removeEventListener("test",h,c)}catch{}return a}();function Pt(a,c){if(ue.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var h=this.type=a.type,v=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=c,c=a.relatedTarget){if(V){e:{try{N(c.nodeName);var x=!0;break e}catch{}x=!1}x||(c=null)}}else h=="mouseover"?c=a.fromElement:h=="mouseout"&&(c=a.toElement);this.relatedTarget=c,v?(this.clientX=v.clientX!==void 0?v.clientX:v.pageX,this.clientY=v.clientY!==void 0?v.clientY:v.pageY,this.screenX=v.screenX||0,this.screenY=v.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:ln[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&Pt.aa.h.call(this)}}C(Pt,ue);var ln={2:"touch",3:"pen",4:"mouse"};Pt.prototype.h=function(){Pt.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var un="closure_listenable_"+(1e6*Math.random()|0),dE=0;function hE(a,c,h,v,x){this.listener=a,this.proxy=null,this.src=c,this.type=h,this.capture=!!v,this.ha=x,this.key=++dE,this.da=this.fa=!1}function qo(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Ho(a){this.src=a,this.g={},this.h=0}Ho.prototype.add=function(a,c,h,v,x){var O=a.toString();a=this.g[O],a||(a=this.g[O]=[],this.h++);var z=bu(a,c,v,x);return-1<z?(c=a[z],h||(c.fa=!1)):(c=new hE(c,this.src,O,!!v,x),c.fa=h,a.push(c)),c};function xu(a,c){var h=c.type;if(h in a.g){var v=a.g[h],x=Array.prototype.indexOf.call(v,c,void 0),O;(O=0<=x)&&Array.prototype.splice.call(v,x,1),O&&(qo(c),a.g[h].length==0&&(delete a.g[h],a.h--))}}function bu(a,c,h,v){for(var x=0;x<a.length;++x){var O=a[x];if(!O.da&&O.listener==c&&O.capture==!!h&&O.ha==v)return x}return-1}var Nu="closure_lm_"+(1e6*Math.random()|0),Du={};function Kf(a,c,h,v,x){if(Array.isArray(c)){for(var O=0;O<c.length;O++)Kf(a,c[O],h,v,x);return null}return h=Yf(h),a&&a[un]?a.K(c,h,d(v)?!!v.capture:!1,x):fE(a,c,h,!1,v,x)}function fE(a,c,h,v,x,O){if(!c)throw Error("Invalid event type");var z=d(x)?!!x.capture:!!x,he=Vu(a);if(he||(a[Nu]=he=new Ho(a)),h=he.add(c,h,v,z,O),h.proxy)return h;if(v=pE(),h.proxy=v,v.src=a,v.listener=h,a.addEventListener)Ct||(x=z),x===void 0&&(x=!1),a.addEventListener(c.toString(),v,x);else if(a.attachEvent)a.attachEvent(Qf(c.toString()),v);else if(a.addListener&&a.removeListener)a.addListener(v);else throw Error("addEventListener and attachEvent are unavailable.");return h}function pE(){function a(h){return c.call(a.src,a.listener,h)}const c=mE;return a}function Gf(a,c,h,v,x){if(Array.isArray(c))for(var O=0;O<c.length;O++)Gf(a,c[O],h,v,x);else v=d(v)?!!v.capture:!!v,h=Yf(h),a&&a[un]?(a=a.i,c=String(c).toString(),c in a.g&&(O=a.g[c],h=bu(O,h,v,x),-1<h&&(qo(O[h]),Array.prototype.splice.call(O,h,1),O.length==0&&(delete a.g[c],a.h--)))):a&&(a=Vu(a))&&(c=a.g[c.toString()],a=-1,c&&(a=bu(c,h,v,x)),(h=-1<a?c[a]:null)&&Ou(h))}function Ou(a){if(typeof a!="number"&&a&&!a.da){var c=a.src;if(c&&c[un])xu(c.i,a);else{var h=a.type,v=a.proxy;c.removeEventListener?c.removeEventListener(h,v,a.capture):c.detachEvent?c.detachEvent(Qf(h),v):c.addListener&&c.removeListener&&c.removeListener(v),(h=Vu(c))?(xu(h,a),h.h==0&&(h.src=null,c[Nu]=null)):qo(a)}}}function Qf(a){return a in Du?Du[a]:Du[a]="on"+a}function mE(a,c){if(a.da)a=!0;else{c=new Pt(c,this);var h=a.listener,v=a.ha||a.src;a.fa&&Ou(a),a=h.call(v,c)}return a}function Vu(a){return a=a[Nu],a instanceof Ho?a:null}var Lu="__closure_events_fn_"+(1e9*Math.random()>>>0);function Yf(a){return typeof a=="function"?a:(a[Lu]||(a[Lu]=function(c){return a.handleEvent(c)}),a[Lu])}function Ge(){Z.call(this),this.i=new Ho(this),this.M=this,this.F=null}C(Ge,Z),Ge.prototype[un]=!0,Ge.prototype.removeEventListener=function(a,c,h,v){Gf(this,a,c,h,v)};function ot(a,c){var h,v=a.F;if(v)for(h=[];v;v=v.F)h.push(v);if(a=a.M,v=c.type||c,typeof c=="string")c=new ue(c,a);else if(c instanceof ue)c.target=c.target||a;else{var x=c;c=new ue(v,a),I(c,x)}if(x=!0,h)for(var O=h.length-1;0<=O;O--){var z=c.g=h[O];x=Ko(z,v,!0,c)&&x}if(z=c.g=a,x=Ko(z,v,!0,c)&&x,x=Ko(z,v,!1,c)&&x,h)for(O=0;O<h.length;O++)z=c.g=h[O],x=Ko(z,v,!1,c)&&x}Ge.prototype.N=function(){if(Ge.aa.N.call(this),this.i){var a=this.i,c;for(c in a.g){for(var h=a.g[c],v=0;v<h.length;v++)qo(h[v]);delete a.g[c],a.h--}}this.F=null},Ge.prototype.K=function(a,c,h,v){return this.i.add(String(a),c,!1,h,v)},Ge.prototype.L=function(a,c,h,v){return this.i.add(String(a),c,!0,h,v)};function Ko(a,c,h,v){if(c=a.i.g[String(c)],!c)return!0;c=c.concat();for(var x=!0,O=0;O<c.length;++O){var z=c[O];if(z&&!z.da&&z.capture==h){var he=z.listener,Ue=z.ha||z.src;z.fa&&xu(a.i,z),x=he.call(Ue,v)!==!1&&x}}return x&&!v.defaultPrevented}function Xf(a,c,h){if(typeof a=="function")h&&(a=y(a,h));else if(a&&typeof a.handleEvent=="function")a=y(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:l.setTimeout(a,c||0)}function Jf(a){a.g=Xf(()=>{a.g=null,a.i&&(a.i=!1,Jf(a))},a.l);const c=a.h;a.h=null,a.m.apply(null,c)}class gE extends Z{constructor(c,h){super(),this.m=c,this.l=h,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Jf(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function is(a){Z.call(this),this.h=a,this.g={}}C(is,Z);var Zf=[];function ep(a){j(a.g,function(c,h){this.g.hasOwnProperty(h)&&Ou(c)},a),a.g={}}is.prototype.N=function(){is.aa.N.call(this),ep(this)},is.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Mu=l.JSON.stringify,yE=l.JSON.parse,vE=class{stringify(a){return l.JSON.stringify(a,void 0)}parse(a){return l.JSON.parse(a,void 0)}};function ju(){}ju.prototype.h=null;function tp(a){return a.h||(a.h=a.i())}function np(){}var ss={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Fu(){ue.call(this,"d")}C(Fu,ue);function Uu(){ue.call(this,"c")}C(Uu,ue);var Ir={},rp=null;function Go(){return rp=rp||new Ge}Ir.La="serverreachability";function ip(a){ue.call(this,Ir.La,a)}C(ip,ue);function os(a){const c=Go();ot(c,new ip(c))}Ir.STAT_EVENT="statevent";function sp(a,c){ue.call(this,Ir.STAT_EVENT,a),this.stat=c}C(sp,ue);function at(a){const c=Go();ot(c,new sp(c,a))}Ir.Ma="timingevent";function op(a,c){ue.call(this,Ir.Ma,a),this.size=c}C(op,ue);function as(a,c){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a()},c)}function ls(){this.g=!0}ls.prototype.xa=function(){this.g=!1};function _E(a,c,h,v,x,O){a.info(function(){if(a.g)if(O)for(var z="",he=O.split("&"),Ue=0;Ue<he.length;Ue++){var oe=he[Ue].split("=");if(1<oe.length){var Qe=oe[0];oe=oe[1];var Ye=Qe.split("_");z=2<=Ye.length&&Ye[1]=="type"?z+(Qe+"="+oe+"&"):z+(Qe+"=redacted&")}}else z=null;else z=O;return"XMLHTTP REQ ("+v+") [attempt "+x+"]: "+c+`
`+h+`
`+z})}function wE(a,c,h,v,x,O,z){a.info(function(){return"XMLHTTP RESP ("+v+") [ attempt "+x+"]: "+c+`
`+h+`
`+O+" "+z})}function ti(a,c,h,v){a.info(function(){return"XMLHTTP TEXT ("+c+"): "+TE(a,h)+(v?" "+v:"")})}function EE(a,c){a.info(function(){return"TIMEOUT: "+c})}ls.prototype.info=function(){};function TE(a,c){if(!a.g)return c;if(!c)return null;try{var h=JSON.parse(c);if(h){for(a=0;a<h.length;a++)if(Array.isArray(h[a])){var v=h[a];if(!(2>v.length)){var x=v[1];if(Array.isArray(x)&&!(1>x.length)){var O=x[0];if(O!="noop"&&O!="stop"&&O!="close")for(var z=1;z<x.length;z++)x[z]=""}}}}return Mu(h)}catch{return c}}var Qo={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},ap={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},zu;function Yo(){}C(Yo,ju),Yo.prototype.g=function(){return new XMLHttpRequest},Yo.prototype.i=function(){return{}},zu=new Yo;function On(a,c,h,v){this.j=a,this.i=c,this.l=h,this.R=v||1,this.U=new is(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new lp}function lp(){this.i=null,this.g="",this.h=!1}var up={},Bu={};function $u(a,c,h){a.L=1,a.v=ea(cn(c)),a.m=h,a.P=!0,cp(a,null)}function cp(a,c){a.F=Date.now(),Xo(a),a.A=cn(a.v);var h=a.A,v=a.R;Array.isArray(v)||(v=[String(v)]),Sp(h.i,"t",v),a.C=0,h=a.j.J,a.h=new lp,a.g=Bp(a.j,h?c:null,!a.m),0<a.O&&(a.M=new gE(y(a.Y,a,a.g),a.O)),c=a.U,h=a.g,v=a.ca;var x="readystatechange";Array.isArray(x)||(x&&(Zf[0]=x.toString()),x=Zf);for(var O=0;O<x.length;O++){var z=Kf(h,x[O],v||c.handleEvent,!1,c.h||c);if(!z)break;c.g[z.key]=z}c=a.H?_(a.H):{},a.m?(a.u||(a.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,c)):(a.u="GET",a.g.ea(a.A,a.u,null,c)),os(),_E(a.i,a.u,a.A,a.l,a.R,a.m)}On.prototype.ca=function(a){a=a.target;const c=this.M;c&&dn(a)==3?c.j():this.Y(a)},On.prototype.Y=function(a){try{if(a==this.g)e:{const Ye=dn(this.g);var c=this.g.Ba();const ii=this.g.Z();if(!(3>Ye)&&(Ye!=3||this.g&&(this.h.h||this.g.oa()||bp(this.g)))){this.J||Ye!=4||c==7||(c==8||0>=ii?os(3):os(2)),Wu(this);var h=this.g.Z();this.X=h;t:if(dp(this)){var v=bp(this.g);a="";var x=v.length,O=dn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Sr(this),us(this);var z="";break t}this.h.i=new l.TextDecoder}for(c=0;c<x;c++)this.h.h=!0,a+=this.h.i.decode(v[c],{stream:!(O&&c==x-1)});v.length=0,this.h.g+=a,this.C=0,z=this.h.g}else z=this.g.oa();if(this.o=h==200,wE(this.i,this.u,this.A,this.l,this.R,Ye,h),this.o){if(this.T&&!this.K){t:{if(this.g){var he,Ue=this.g;if((he=Ue.g?Ue.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!E(he)){var oe=he;break t}}oe=null}if(h=oe)ti(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,qu(this,h);else{this.o=!1,this.s=3,at(12),Sr(this),us(this);break e}}if(this.P){h=!0;let Ft;for(;!this.J&&this.C<z.length;)if(Ft=IE(this,z),Ft==Bu){Ye==4&&(this.s=4,at(14),h=!1),ti(this.i,this.l,null,"[Incomplete Response]");break}else if(Ft==up){this.s=4,at(15),ti(this.i,this.l,z,"[Invalid Chunk]"),h=!1;break}else ti(this.i,this.l,Ft,null),qu(this,Ft);if(dp(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Ye!=4||z.length!=0||this.h.h||(this.s=1,at(16),h=!1),this.o=this.o&&h,!h)ti(this.i,this.l,z,"[Invalid Chunked Response]"),Sr(this),us(this);else if(0<z.length&&!this.W){this.W=!0;var Qe=this.j;Qe.g==this&&Qe.ba&&!Qe.M&&(Qe.j.info("Great, no buffering proxy detected. Bytes received: "+z.length),Xu(Qe),Qe.M=!0,at(11))}}else ti(this.i,this.l,z,null),qu(this,z);Ye==4&&Sr(this),this.o&&!this.J&&(Ye==4?jp(this.j,this):(this.o=!1,Xo(this)))}else UE(this.g),h==400&&0<z.indexOf("Unknown SID")?(this.s=3,at(12)):(this.s=0,at(13)),Sr(this),us(this)}}}catch{}finally{}};function dp(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function IE(a,c){var h=a.C,v=c.indexOf(`
`,h);return v==-1?Bu:(h=Number(c.substring(h,v)),isNaN(h)?up:(v+=1,v+h>c.length?Bu:(c=c.slice(v,v+h),a.C=v+h,c)))}On.prototype.cancel=function(){this.J=!0,Sr(this)};function Xo(a){a.S=Date.now()+a.I,hp(a,a.I)}function hp(a,c){if(a.B!=null)throw Error("WatchDog timer not null");a.B=as(y(a.ba,a),c)}function Wu(a){a.B&&(l.clearTimeout(a.B),a.B=null)}On.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(EE(this.i,this.A),this.L!=2&&(os(),at(17)),Sr(this),this.s=2,us(this)):hp(this,this.S-a)};function us(a){a.j.G==0||a.J||jp(a.j,a)}function Sr(a){Wu(a);var c=a.M;c&&typeof c.ma=="function"&&c.ma(),a.M=null,ep(a.U),a.g&&(c=a.g,a.g=null,c.abort(),c.ma())}function qu(a,c){try{var h=a.j;if(h.G!=0&&(h.g==a||Hu(h.h,a))){if(!a.K&&Hu(h.h,a)&&h.G==3){try{var v=h.Da.g.parse(c)}catch{v=null}if(Array.isArray(v)&&v.length==3){var x=v;if(x[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<a.F)oa(h),ia(h);else break e;Yu(h),at(18)}}else h.za=x[1],0<h.za-h.T&&37500>x[2]&&h.F&&h.v==0&&!h.C&&(h.C=as(y(h.Za,h),6e3));if(1>=mp(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else Rr(h,11)}else if((a.K||h.g==a)&&oa(h),!E(c))for(x=h.Da.g.parse(c),c=0;c<x.length;c++){let oe=x[c];if(h.T=oe[0],oe=oe[1],h.G==2)if(oe[0]=="c"){h.K=oe[1],h.ia=oe[2];const Qe=oe[3];Qe!=null&&(h.la=Qe,h.j.info("VER="+h.la));const Ye=oe[4];Ye!=null&&(h.Aa=Ye,h.j.info("SVER="+h.Aa));const ii=oe[5];ii!=null&&typeof ii=="number"&&0<ii&&(v=1.5*ii,h.L=v,h.j.info("backChannelRequestTimeoutMs_="+v)),v=h;const Ft=a.g;if(Ft){const la=Ft.g?Ft.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(la){var O=v.h;O.g||la.indexOf("spdy")==-1&&la.indexOf("quic")==-1&&la.indexOf("h2")==-1||(O.j=O.l,O.g=new Set,O.h&&(Ku(O,O.h),O.h=null))}if(v.D){const Ju=Ft.g?Ft.g.getResponseHeader("X-HTTP-Session-Id"):null;Ju&&(v.ya=Ju,pe(v.I,v.D,Ju))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-a.F,h.j.info("Handshake RTT: "+h.R+"ms")),v=h;var z=a;if(v.qa=zp(v,v.J?v.ia:null,v.W),z.K){gp(v.h,z);var he=z,Ue=v.L;Ue&&(he.I=Ue),he.B&&(Wu(he),Xo(he)),v.g=z}else Lp(v);0<h.i.length&&sa(h)}else oe[0]!="stop"&&oe[0]!="close"||Rr(h,7);else h.G==3&&(oe[0]=="stop"||oe[0]=="close"?oe[0]=="stop"?Rr(h,7):Qu(h):oe[0]!="noop"&&h.l&&h.l.ta(oe),h.v=0)}}os(4)}catch{}}var SE=class{constructor(a,c){this.g=a,this.map=c}};function fp(a){this.l=a||10,l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function pp(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function mp(a){return a.h?1:a.g?a.g.size:0}function Hu(a,c){return a.h?a.h==c:a.g?a.g.has(c):!1}function Ku(a,c){a.g?a.g.add(c):a.h=c}function gp(a,c){a.h&&a.h==c?a.h=null:a.g&&a.g.has(c)&&a.g.delete(c)}fp.prototype.cancel=function(){if(this.i=yp(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function yp(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let c=a.i;for(const h of a.g.values())c=c.concat(h.D);return c}return b(a.i)}function AE(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var c=[],h=a.length,v=0;v<h;v++)c.push(a[v]);return c}c=[],h=0;for(v in a)c[h++]=a[v];return c}function RE(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var c=[];a=a.length;for(var h=0;h<a;h++)c.push(h);return c}c=[],h=0;for(const v in a)c[h++]=v;return c}}}function vp(a,c){if(a.forEach&&typeof a.forEach=="function")a.forEach(c,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,c,void 0);else for(var h=RE(a),v=AE(a),x=v.length,O=0;O<x;O++)c.call(void 0,v[O],h&&h[O],a)}var _p=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function kE(a,c){if(a){a=a.split("&");for(var h=0;h<a.length;h++){var v=a[h].indexOf("="),x=null;if(0<=v){var O=a[h].substring(0,v);x=a[h].substring(v+1)}else O=a[h];c(O,x?decodeURIComponent(x.replace(/\+/g," ")):"")}}}function Ar(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof Ar){this.h=a.h,Jo(this,a.j),this.o=a.o,this.g=a.g,Zo(this,a.s),this.l=a.l;var c=a.i,h=new hs;h.i=c.i,c.g&&(h.g=new Map(c.g),h.h=c.h),wp(this,h),this.m=a.m}else a&&(c=String(a).match(_p))?(this.h=!1,Jo(this,c[1]||"",!0),this.o=cs(c[2]||""),this.g=cs(c[3]||"",!0),Zo(this,c[4]),this.l=cs(c[5]||"",!0),wp(this,c[6]||"",!0),this.m=cs(c[7]||"")):(this.h=!1,this.i=new hs(null,this.h))}Ar.prototype.toString=function(){var a=[],c=this.j;c&&a.push(ds(c,Ep,!0),":");var h=this.g;return(h||c=="file")&&(a.push("//"),(c=this.o)&&a.push(ds(c,Ep,!0),"@"),a.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&a.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&a.push("/"),a.push(ds(h,h.charAt(0)=="/"?xE:PE,!0))),(h=this.i.toString())&&a.push("?",h),(h=this.m)&&a.push("#",ds(h,NE)),a.join("")};function cn(a){return new Ar(a)}function Jo(a,c,h){a.j=h?cs(c,!0):c,a.j&&(a.j=a.j.replace(/:$/,""))}function Zo(a,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);a.s=c}else a.s=null}function wp(a,c,h){c instanceof hs?(a.i=c,DE(a.i,a.h)):(h||(c=ds(c,bE)),a.i=new hs(c,a.h))}function pe(a,c,h){a.i.set(c,h)}function ea(a){return pe(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function cs(a,c){return a?c?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function ds(a,c,h){return typeof a=="string"?(a=encodeURI(a).replace(c,CE),h&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function CE(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Ep=/[#\/\?@]/g,PE=/[#\?:]/g,xE=/[#\?]/g,bE=/[#\?@]/g,NE=/#/g;function hs(a,c){this.h=this.g=null,this.i=a||null,this.j=!!c}function Vn(a){a.g||(a.g=new Map,a.h=0,a.i&&kE(a.i,function(c,h){a.add(decodeURIComponent(c.replace(/\+/g," ")),h)}))}t=hs.prototype,t.add=function(a,c){Vn(this),this.i=null,a=ni(this,a);var h=this.g.get(a);return h||this.g.set(a,h=[]),h.push(c),this.h+=1,this};function Tp(a,c){Vn(a),c=ni(a,c),a.g.has(c)&&(a.i=null,a.h-=a.g.get(c).length,a.g.delete(c))}function Ip(a,c){return Vn(a),c=ni(a,c),a.g.has(c)}t.forEach=function(a,c){Vn(this),this.g.forEach(function(h,v){h.forEach(function(x){a.call(c,x,v,this)},this)},this)},t.na=function(){Vn(this);const a=Array.from(this.g.values()),c=Array.from(this.g.keys()),h=[];for(let v=0;v<c.length;v++){const x=a[v];for(let O=0;O<x.length;O++)h.push(c[v])}return h},t.V=function(a){Vn(this);let c=[];if(typeof a=="string")Ip(this,a)&&(c=c.concat(this.g.get(ni(this,a))));else{a=Array.from(this.g.values());for(let h=0;h<a.length;h++)c=c.concat(a[h])}return c},t.set=function(a,c){return Vn(this),this.i=null,a=ni(this,a),Ip(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[c]),this.h+=1,this},t.get=function(a,c){return a?(a=this.V(a),0<a.length?String(a[0]):c):c};function Sp(a,c,h){Tp(a,c),0<h.length&&(a.i=null,a.g.set(ni(a,c),b(h)),a.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],c=Array.from(this.g.keys());for(var h=0;h<c.length;h++){var v=c[h];const O=encodeURIComponent(String(v)),z=this.V(v);for(v=0;v<z.length;v++){var x=O;z[v]!==""&&(x+="="+encodeURIComponent(String(z[v]))),a.push(x)}}return this.i=a.join("&")};function ni(a,c){return c=String(c),a.j&&(c=c.toLowerCase()),c}function DE(a,c){c&&!a.j&&(Vn(a),a.i=null,a.g.forEach(function(h,v){var x=v.toLowerCase();v!=x&&(Tp(this,v),Sp(this,x,h))},a)),a.j=c}function OE(a,c){const h=new ls;if(l.Image){const v=new Image;v.onload=R(Ln,h,"TestLoadImage: loaded",!0,c,v),v.onerror=R(Ln,h,"TestLoadImage: error",!1,c,v),v.onabort=R(Ln,h,"TestLoadImage: abort",!1,c,v),v.ontimeout=R(Ln,h,"TestLoadImage: timeout",!1,c,v),l.setTimeout(function(){v.ontimeout&&v.ontimeout()},1e4),v.src=a}else c(!1)}function VE(a,c){const h=new ls,v=new AbortController,x=setTimeout(()=>{v.abort(),Ln(h,"TestPingServer: timeout",!1,c)},1e4);fetch(a,{signal:v.signal}).then(O=>{clearTimeout(x),O.ok?Ln(h,"TestPingServer: ok",!0,c):Ln(h,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(x),Ln(h,"TestPingServer: error",!1,c)})}function Ln(a,c,h,v,x){try{x&&(x.onload=null,x.onerror=null,x.onabort=null,x.ontimeout=null),v(h)}catch{}}function LE(){this.g=new vE}function ME(a,c,h){const v=h||"";try{vp(a,function(x,O){let z=x;d(x)&&(z=Mu(x)),c.push(v+O+"="+encodeURIComponent(z))})}catch(x){throw c.push(v+"type="+encodeURIComponent("_badmap")),x}}function ta(a){this.l=a.Ub||null,this.j=a.eb||!1}C(ta,ju),ta.prototype.g=function(){return new na(this.l,this.j)},ta.prototype.i=function(a){return function(){return a}}({});function na(a,c){Ge.call(this),this.D=a,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(na,Ge),t=na.prototype,t.open=function(a,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=c,this.readyState=1,ps(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(c.body=a),(this.D||l).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,fs(this)),this.readyState=0},t.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,ps(this)),this.g&&(this.readyState=3,ps(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Ap(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function Ap(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}t.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var c=a.value?a.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!a.done}))&&(this.response=this.responseText+=c)}a.done?fs(this):ps(this),this.readyState==3&&Ap(this)}},t.Ra=function(a){this.g&&(this.response=this.responseText=a,fs(this))},t.Qa=function(a){this.g&&(this.response=a,fs(this))},t.ga=function(){this.g&&fs(this)};function fs(a){a.readyState=4,a.l=null,a.j=null,a.v=null,ps(a)}t.setRequestHeader=function(a,c){this.u.append(a,c)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],c=this.h.entries();for(var h=c.next();!h.done;)h=h.value,a.push(h[0]+": "+h[1]),h=c.next();return a.join(`\r
`)};function ps(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(na.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Rp(a){let c="";return j(a,function(h,v){c+=v,c+=":",c+=h,c+=`\r
`}),c}function Gu(a,c,h){e:{for(v in h){var v=!1;break e}v=!0}v||(h=Rp(h),typeof a=="string"?h!=null&&encodeURIComponent(String(h)):pe(a,c,h))}function Ie(a){Ge.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(Ie,Ge);var jE=/^https?$/i,FE=["POST","PUT"];t=Ie.prototype,t.Ha=function(a){this.J=a},t.ea=function(a,c,h,v){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);c=c?c.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():zu.g(),this.v=this.o?tp(this.o):tp(zu),this.g.onreadystatechange=y(this.Ea,this);try{this.B=!0,this.g.open(c,String(a),!0),this.B=!1}catch(O){kp(this,O);return}if(a=h||"",h=new Map(this.headers),v)if(Object.getPrototypeOf(v)===Object.prototype)for(var x in v)h.set(x,v[x]);else if(typeof v.keys=="function"&&typeof v.get=="function")for(const O of v.keys())h.set(O,v.get(O));else throw Error("Unknown input type for opt_headers: "+String(v));v=Array.from(h.keys()).find(O=>O.toLowerCase()=="content-type"),x=l.FormData&&a instanceof l.FormData,!(0<=Array.prototype.indexOf.call(FE,c,void 0))||v||x||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[O,z]of h)this.g.setRequestHeader(O,z);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{xp(this),this.u=!0,this.g.send(a),this.u=!1}catch(O){kp(this,O)}};function kp(a,c){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=c,a.m=5,Cp(a),ra(a)}function Cp(a){a.A||(a.A=!0,ot(a,"complete"),ot(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,ot(this,"complete"),ot(this,"abort"),ra(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ra(this,!0)),Ie.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?Pp(this):this.bb())},t.bb=function(){Pp(this)};function Pp(a){if(a.h&&typeof o<"u"&&(!a.v[1]||dn(a)!=4||a.Z()!=2)){if(a.u&&dn(a)==4)Xf(a.Ea,0,a);else if(ot(a,"readystatechange"),dn(a)==4){a.h=!1;try{const z=a.Z();e:switch(z){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var h;if(!(h=c)){var v;if(v=z===0){var x=String(a.D).match(_p)[1]||null;!x&&l.self&&l.self.location&&(x=l.self.location.protocol.slice(0,-1)),v=!jE.test(x?x.toLowerCase():"")}h=v}if(h)ot(a,"complete"),ot(a,"success");else{a.m=6;try{var O=2<dn(a)?a.g.statusText:""}catch{O=""}a.l=O+" ["+a.Z()+"]",Cp(a)}}finally{ra(a)}}}}function ra(a,c){if(a.g){xp(a);const h=a.g,v=a.v[0]?()=>{}:null;a.g=null,a.v=null,c||ot(a,"ready");try{h.onreadystatechange=v}catch{}}}function xp(a){a.I&&(l.clearTimeout(a.I),a.I=null)}t.isActive=function(){return!!this.g};function dn(a){return a.g?a.g.readyState:0}t.Z=function(){try{return 2<dn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(a){if(this.g){var c=this.g.responseText;return a&&c.indexOf(a)==0&&(c=c.substring(a.length)),yE(c)}};function bp(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function UE(a){const c={};a=(a.g&&2<=dn(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let v=0;v<a.length;v++){if(E(a[v]))continue;var h=k(a[v]);const x=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const O=c[x]||[];c[x]=O,O.push(h)}g(c,function(v){return v.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function ms(a,c,h){return h&&h.internalChannelParams&&h.internalChannelParams[a]||c}function Np(a){this.Aa=0,this.i=[],this.j=new ls,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=ms("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=ms("baseRetryDelayMs",5e3,a),this.cb=ms("retryDelaySeedMs",1e4,a),this.Wa=ms("forwardChannelMaxRetries",2,a),this.wa=ms("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new fp(a&&a.concurrentRequestLimit),this.Da=new LE,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=Np.prototype,t.la=8,t.G=1,t.connect=function(a,c,h,v){at(0),this.W=a,this.H=c||{},h&&v!==void 0&&(this.H.OSID=h,this.H.OAID=v),this.F=this.X,this.I=zp(this,null,this.W),sa(this)};function Qu(a){if(Dp(a),a.G==3){var c=a.U++,h=cn(a.I);if(pe(h,"SID",a.K),pe(h,"RID",c),pe(h,"TYPE","terminate"),gs(a,h),c=new On(a,a.j,c),c.L=2,c.v=ea(cn(h)),h=!1,l.navigator&&l.navigator.sendBeacon)try{h=l.navigator.sendBeacon(c.v.toString(),"")}catch{}!h&&l.Image&&(new Image().src=c.v,h=!0),h||(c.g=Bp(c.j,null),c.g.ea(c.v)),c.F=Date.now(),Xo(c)}Up(a)}function ia(a){a.g&&(Xu(a),a.g.cancel(),a.g=null)}function Dp(a){ia(a),a.u&&(l.clearTimeout(a.u),a.u=null),oa(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&l.clearTimeout(a.s),a.s=null)}function sa(a){if(!pp(a.h)&&!a.s){a.s=!0;var c=a.Ga;kt||K(),$||(kt(),$=!0),D.add(c,a),a.B=0}}function zE(a,c){return mp(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=c.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=as(y(a.Ga,a,c),Fp(a,a.B)),a.B++,!0)}t.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const x=new On(this,this.j,a);let O=this.o;if(this.S&&(O?(O=_(O),I(O,this.S)):O=this.S),this.m!==null||this.O||(x.H=O,O=null),this.P)e:{for(var c=0,h=0;h<this.i.length;h++){t:{var v=this.i[h];if("__data__"in v.map&&(v=v.map.__data__,typeof v=="string")){v=v.length;break t}v=void 0}if(v===void 0)break;if(c+=v,4096<c){c=h;break e}if(c===4096||h===this.i.length-1){c=h+1;break e}}c=1e3}else c=1e3;c=Vp(this,x,c),h=cn(this.I),pe(h,"RID",a),pe(h,"CVER",22),this.D&&pe(h,"X-HTTP-Session-Id",this.D),gs(this,h),O&&(this.O?c="headers="+encodeURIComponent(String(Rp(O)))+"&"+c:this.m&&Gu(h,this.m,O)),Ku(this.h,x),this.Ua&&pe(h,"TYPE","init"),this.P?(pe(h,"$req",c),pe(h,"SID","null"),x.T=!0,$u(x,h,null)):$u(x,h,c),this.G=2}}else this.G==3&&(a?Op(this,a):this.i.length==0||pp(this.h)||Op(this))};function Op(a,c){var h;c?h=c.l:h=a.U++;const v=cn(a.I);pe(v,"SID",a.K),pe(v,"RID",h),pe(v,"AID",a.T),gs(a,v),a.m&&a.o&&Gu(v,a.m,a.o),h=new On(a,a.j,h,a.B+1),a.m===null&&(h.H=a.o),c&&(a.i=c.D.concat(a.i)),c=Vp(a,h,1e3),h.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),Ku(a.h,h),$u(h,v,c)}function gs(a,c){a.H&&j(a.H,function(h,v){pe(c,v,h)}),a.l&&vp({},function(h,v){pe(c,v,h)})}function Vp(a,c,h){h=Math.min(a.i.length,h);var v=a.l?y(a.l.Na,a.l,a):null;e:{var x=a.i;let O=-1;for(;;){const z=["count="+h];O==-1?0<h?(O=x[0].g,z.push("ofs="+O)):O=0:z.push("ofs="+O);let he=!0;for(let Ue=0;Ue<h;Ue++){let oe=x[Ue].g;const Qe=x[Ue].map;if(oe-=O,0>oe)O=Math.max(0,x[Ue].g-100),he=!1;else try{ME(Qe,z,"req"+oe+"_")}catch{v&&v(Qe)}}if(he){v=z.join("&");break e}}}return a=a.i.splice(0,h),c.D=a,v}function Lp(a){if(!a.g&&!a.u){a.Y=1;var c=a.Fa;kt||K(),$||(kt(),$=!0),D.add(c,a),a.v=0}}function Yu(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=as(y(a.Fa,a),Fp(a,a.v)),a.v++,!0)}t.Fa=function(){if(this.u=null,Mp(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=as(y(this.ab,this),a)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,at(10),ia(this),Mp(this))};function Xu(a){a.A!=null&&(l.clearTimeout(a.A),a.A=null)}function Mp(a){a.g=new On(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var c=cn(a.qa);pe(c,"RID","rpc"),pe(c,"SID",a.K),pe(c,"AID",a.T),pe(c,"CI",a.F?"0":"1"),!a.F&&a.ja&&pe(c,"TO",a.ja),pe(c,"TYPE","xmlhttp"),gs(a,c),a.m&&a.o&&Gu(c,a.m,a.o),a.L&&(a.g.I=a.L);var h=a.g;a=a.ia,h.L=1,h.v=ea(cn(c)),h.m=null,h.P=!0,cp(h,a)}t.Za=function(){this.C!=null&&(this.C=null,ia(this),Yu(this),at(19))};function oa(a){a.C!=null&&(l.clearTimeout(a.C),a.C=null)}function jp(a,c){var h=null;if(a.g==c){oa(a),Xu(a),a.g=null;var v=2}else if(Hu(a.h,c))h=c.D,gp(a.h,c),v=1;else return;if(a.G!=0){if(c.o)if(v==1){h=c.m?c.m.length:0,c=Date.now()-c.F;var x=a.B;v=Go(),ot(v,new op(v,h)),sa(a)}else Lp(a);else if(x=c.s,x==3||x==0&&0<c.X||!(v==1&&zE(a,c)||v==2&&Yu(a)))switch(h&&0<h.length&&(c=a.h,c.i=c.i.concat(h)),x){case 1:Rr(a,5);break;case 4:Rr(a,10);break;case 3:Rr(a,6);break;default:Rr(a,2)}}}function Fp(a,c){let h=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(h*=2),h*c}function Rr(a,c){if(a.j.info("Error code "+c),c==2){var h=y(a.fb,a),v=a.Xa;const x=!v;v=new Ar(v||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Jo(v,"https"),ea(v),x?OE(v.toString(),h):VE(v.toString(),h)}else at(2);a.G=0,a.l&&a.l.sa(c),Up(a),Dp(a)}t.fb=function(a){a?(this.j.info("Successfully pinged google.com"),at(2)):(this.j.info("Failed to ping google.com"),at(1))};function Up(a){if(a.G=0,a.ka=[],a.l){const c=yp(a.h);(c.length!=0||a.i.length!=0)&&(L(a.ka,c),L(a.ka,a.i),a.h.i.length=0,b(a.i),a.i.length=0),a.l.ra()}}function zp(a,c,h){var v=h instanceof Ar?cn(h):new Ar(h);if(v.g!="")c&&(v.g=c+"."+v.g),Zo(v,v.s);else{var x=l.location;v=x.protocol,c=c?c+"."+x.hostname:x.hostname,x=+x.port;var O=new Ar(null);v&&Jo(O,v),c&&(O.g=c),x&&Zo(O,x),h&&(O.l=h),v=O}return h=a.D,c=a.ya,h&&c&&pe(v,h,c),pe(v,"VER",a.la),gs(a,v),v}function Bp(a,c,h){if(c&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=a.Ca&&!a.pa?new Ie(new ta({eb:h})):new Ie(a.pa),c.Ha(a.J),c}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function $p(){}t=$p.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function aa(){}aa.prototype.g=function(a,c){return new vt(a,c)};function vt(a,c){Ge.call(this),this.g=new Np(c),this.l=a,this.h=c&&c.messageUrlParams||null,a=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(a?a["X-WebChannel-Content-Type"]=c.messageContentType:a={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(a?a["X-WebChannel-Client-Profile"]=c.va:a={"X-WebChannel-Client-Profile":c.va}),this.g.S=a,(a=c&&c.Sb)&&!E(a)&&(this.g.m=a),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!E(c)&&(this.g.D=c,a=this.h,a!==null&&c in a&&(a=this.h,c in a&&delete a[c])),this.j=new ri(this)}C(vt,Ge),vt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},vt.prototype.close=function(){Qu(this.g)},vt.prototype.o=function(a){var c=this.g;if(typeof a=="string"){var h={};h.__data__=a,a=h}else this.u&&(h={},h.__data__=Mu(a),a=h);c.i.push(new SE(c.Ya++,a)),c.G==3&&sa(c)},vt.prototype.N=function(){this.g.l=null,delete this.j,Qu(this.g),delete this.g,vt.aa.N.call(this)};function Wp(a){Fu.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var c=a.__sm__;if(c){e:{for(const h in c){a=h;break e}a=void 0}(this.i=a)&&(a=this.i,c=c!==null&&a in c?c[a]:void 0),this.data=c}else this.data=a}C(Wp,Fu);function qp(){Uu.call(this),this.status=1}C(qp,Uu);function ri(a){this.g=a}C(ri,$p),ri.prototype.ua=function(){ot(this.g,"a")},ri.prototype.ta=function(a){ot(this.g,new Wp(a))},ri.prototype.sa=function(a){ot(this.g,new qp)},ri.prototype.ra=function(){ot(this.g,"b")},aa.prototype.createWebChannel=aa.prototype.g,vt.prototype.send=vt.prototype.o,vt.prototype.open=vt.prototype.m,vt.prototype.close=vt.prototype.close,F0=function(){return new aa},j0=function(){return Go()},M0=Ir,Ud={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Qo.NO_ERROR=0,Qo.TIMEOUT=8,Qo.HTTP_ERROR=6,Qa=Qo,ap.COMPLETE="complete",L0=ap,np.EventType=ss,ss.OPEN="a",ss.CLOSE="b",ss.ERROR="c",ss.MESSAGE="d",Ge.prototype.listen=Ge.prototype.K,Ns=np,Ie.prototype.listenOnce=Ie.prototype.L,Ie.prototype.getLastError=Ie.prototype.Ka,Ie.prototype.getLastErrorCode=Ie.prototype.Ba,Ie.prototype.getStatus=Ie.prototype.Z,Ie.prototype.getResponseJson=Ie.prototype.Oa,Ie.prototype.getResponseText=Ie.prototype.oa,Ie.prototype.send=Ie.prototype.ea,Ie.prototype.setWithCredentials=Ie.prototype.Ha,V0=Ie}).apply(typeof Ca<"u"?Ca:typeof self<"u"?self:typeof window<"u"?window:{});const Ng="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}et.UNAUTHENTICATED=new et(null),et.GOOGLE_CREDENTIALS=new et("google-credentials-uid"),et.FIRST_PARTY=new et("first-party-uid"),et.MOCK_USER=new et("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let es="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qr=new Zh("@firebase/firestore");function As(){return qr.logLevel}function H(t,...e){if(qr.logLevel<=re.DEBUG){const n=e.map(ff);qr.debug(`Firestore (${es}): ${t}`,...n)}}function Pn(t,...e){if(qr.logLevel<=re.ERROR){const n=e.map(ff);qr.error(`Firestore (${es}): ${t}`,...n)}}function Bi(t,...e){if(qr.logLevel<=re.WARN){const n=e.map(ff);qr.warn(`Firestore (${es}): ${t}`,...n)}}function ff(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Y(t="Unexpected state"){const e=`FIRESTORE (${es}) INTERNAL ASSERTION FAILED: `+t;throw Pn(e),new Error(e)}function de(t,e){t||Y()}function J(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class q extends Nn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lr{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U0{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Kk{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(et.UNAUTHENTICATED))}shutdown(){}}class Gk{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class Qk{constructor(e){this.t=e,this.currentUser=et.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){de(this.o===void 0);let r=this.i;const i=u=>this.i!==r?(r=this.i,n(u)):Promise.resolve();let s=new lr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new lr,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},l=u=>{H("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?l(u):(H("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new lr)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(H("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(de(typeof r.accessToken=="string"),new U0(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return de(e===null||typeof e=="string"),new et(e)}}class Yk{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=et.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Xk{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new Yk(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(et.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Jk{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Zk{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){de(this.o===void 0);const r=s=>{s.error!=null&&H("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.R;return this.R=s.token,H("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{H("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.A.getImmediate({optional:!0});s?i(s):H("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(de(typeof n.token=="string"),this.R=n.token,new Jk(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eC(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z0{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const i=eC(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<n&&(r+=e.charAt(i[s]%e.length))}return r}}function ae(t,e){return t<e?-1:t>e?1:0}function $i(t,e,n){return t.length===e.length&&t.every((r,i)=>n(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new q(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new q(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new q(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new q(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return Ve.fromMillis(Date.now())}static fromDate(e){return Ve.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*n));return new Ve(n,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?ae(this.nanoseconds,e.nanoseconds):ae(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X{constructor(e){this.timestamp=e}static fromTimestamp(e){return new X(e)}static min(){return new X(new Ve(0,0))}static max(){return new X(new Ve(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class go{constructor(e,n,r){n===void 0?n=0:n>e.length&&Y(),r===void 0?r=e.length-n:r>e.length-n&&Y(),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return go.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof go?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let i=0;i<r;i++){const s=e.get(i),o=n.get(i);if(s<o)return-1;if(s>o)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class ge extends go{construct(e,n,r){return new ge(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new q(M.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(i=>i.length>0))}return new ge(n)}static emptyPath(){return new ge([])}}const tC=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class $e extends go{construct(e,n,r){return new $e(e,n,r)}static isValidIdentifier(e){return tC.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),$e.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new $e(["__name__"])}static fromServerFormat(e){const n=[];let r="",i=0;const s=()=>{if(r.length===0)throw new q(M.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new q(M.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new q(M.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else l==="`"?(o=!o,i++):l!=="."||o?(r+=l,i++):(s(),i++)}if(s(),o)throw new q(M.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new $e(n)}static emptyPath(){return new $e([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(e){this.path=e}static fromPath(e){return new G(ge.fromString(e))}static fromName(e){return new G(ge.fromString(e).popFirst(5))}static empty(){return new G(ge.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ge.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return ge.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new G(new ge(e.slice()))}}function nC(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,i=X.fromTimestamp(r===1e9?new Ve(n+1,0):new Ve(n,r));return new hr(i,G.empty(),e)}function rC(t){return new hr(t.readTime,t.key,-1)}class hr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new hr(X.min(),G.empty(),-1)}static max(){return new hr(X.max(),G.empty(),-1)}}function iC(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=G.comparator(t.documentKey,e.documentKey),n!==0?n:ae(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sC="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class oC{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vo(t){if(t.code!==M.FAILED_PRECONDITION||t.message!==sC)throw t;H("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&Y(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new F((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(n,s).next(r,i)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof F?n:F.resolve(n)}catch(n){return F.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):F.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):F.reject(n)}static resolve(e){return new F((n,r)=>{n(e)})}static reject(e){return new F((n,r)=>{r(e)})}static waitFor(e){return new F((n,r)=>{let i=0,s=0,o=!1;e.forEach(l=>{++i,l.next(()=>{++s,o&&s===i&&n()},u=>r(u))}),o=!0,s===i&&n()})}static or(e){let n=F.resolve(!1);for(const r of e)n=n.next(i=>i?F.resolve(i):r());return n}static forEach(e,n){const r=[];return e.forEach((i,s)=>{r.push(n.call(this,i,s))}),this.waitFor(r)}static mapArray(e,n){return new F((r,i)=>{const s=e.length,o=new Array(s);let l=0;for(let u=0;u<s;u++){const d=u;n(e[d]).next(f=>{o[d]=f,++l,l===s&&r(o)},f=>i(f))}})}static doWhile(e,n){return new F((r,i)=>{const s=()=>{e()===!0?n().next(()=>{s()},i):r()};s()})}}function aC(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Lo(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pf{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ie(r),this.se=r=>n.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}pf.oe=-1;function cu(t){return t==null}function Dl(t){return t===0&&1/t==-1/0}function lC(t){return typeof t=="number"&&Number.isInteger(t)&&!Dl(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dg(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Jr(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function B0(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(e,n){this.comparator=e,this.root=n||Be.EMPTY}insert(e,n){return new Te(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Be.BLACK,null,null))}remove(e){return new Te(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Be.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return n+r.left.size;i<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Pa(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Pa(this.root,e,this.comparator,!1)}getReverseIterator(){return new Pa(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Pa(this.root,e,this.comparator,!0)}}class Pa{constructor(e,n,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?r(e.key,n):1,n&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Be{constructor(e,n,r,i,s){this.key=e,this.value=n,this.color=r??Be.RED,this.left=i??Be.EMPTY,this.right=s??Be.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,i,s){return new Be(e??this.key,n??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,n,r),null):s===0?i.copy(null,n,null,null,null):i.copy(null,null,null,null,i.right.insert(e,n,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Be.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,i=this;if(n(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,n),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),n(e,i.key)===0){if(i.right.isEmpty())return Be.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,n))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Be.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Be.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw Y();const e=this.left.check();if(e!==this.right.check())throw Y();return e+(this.isRed()?0:1)}}Be.EMPTY=null,Be.RED=!0,Be.BLACK=!1;Be.EMPTY=new class{constructor(){this.size=0}get key(){throw Y()}get value(){throw Y()}get color(){throw Y()}get left(){throw Y()}get right(){throw Y()}copy(e,n,r,i,s){return this}insert(e,n,r){return new Be(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e){this.comparator=e,this.data=new Te(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;n(i.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new Og(this.data.getIterator())}getIteratorFrom(e){return new Og(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof qe)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new qe(this.comparator);return n.data=e,n}}class Og{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et{constructor(e){this.fields=e,e.sort($e.comparator)}static empty(){return new Et([])}unionWith(e){let n=new qe($e.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new Et(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return $i(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $0 extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new $0("Invalid base64 string: "+s):s}}(e);return new Ke(n)}static fromUint8Array(e){const n=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new Ke(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ae(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ke.EMPTY_BYTE_STRING=new Ke("");const uC=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function fr(t){if(de(!!t),typeof t=="string"){let e=0;const n=uC.exec(t);if(de(!!n),n[1]){let i=n[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Ae(t.seconds),nanos:Ae(t.nanos)}}function Ae(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Hr(t){return typeof t=="string"?Ke.fromBase64String(t):Ke.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mf(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function gf(t){const e=t.mapValue.fields.__previous_value__;return mf(e)?gf(e):e}function yo(t){const e=fr(t.mapValue.fields.__local_write_time__.timestampValue);return new Ve(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cC{constructor(e,n,r,i,s,o,l,u,d){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=d}}class vo{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new vo("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof vo&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xa={mapValue:{}};function Kr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?mf(t)?4:hC(t)?9007199254740991:dC(t)?10:11:Y()}function an(t,e){if(t===e)return!0;const n=Kr(t);if(n!==Kr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return yo(t).isEqual(yo(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=fr(i.timestampValue),l=fr(s.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(i,s){return Hr(i.bytesValue).isEqual(Hr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(i,s){return Ae(i.geoPointValue.latitude)===Ae(s.geoPointValue.latitude)&&Ae(i.geoPointValue.longitude)===Ae(s.geoPointValue.longitude)}(t,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return Ae(i.integerValue)===Ae(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=Ae(i.doubleValue),l=Ae(s.doubleValue);return o===l?Dl(o)===Dl(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return $i(t.arrayValue.values||[],e.arrayValue.values||[],an);case 10:case 11:return function(i,s){const o=i.mapValue.fields||{},l=s.mapValue.fields||{};if(Dg(o)!==Dg(l))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(l[u]===void 0||!an(o[u],l[u])))return!1;return!0}(t,e);default:return Y()}}function _o(t,e){return(t.values||[]).find(n=>an(n,e))!==void 0}function Wi(t,e){if(t===e)return 0;const n=Kr(t),r=Kr(e);if(n!==r)return ae(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return ae(t.booleanValue,e.booleanValue);case 2:return function(s,o){const l=Ae(s.integerValue||s.doubleValue),u=Ae(o.integerValue||o.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return Vg(t.timestampValue,e.timestampValue);case 4:return Vg(yo(t),yo(e));case 5:return ae(t.stringValue,e.stringValue);case 6:return function(s,o){const l=Hr(s),u=Hr(o);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(s,o){const l=s.split("/"),u=o.split("/");for(let d=0;d<l.length&&d<u.length;d++){const f=ae(l[d],u[d]);if(f!==0)return f}return ae(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,o){const l=ae(Ae(s.latitude),Ae(o.latitude));return l!==0?l:ae(Ae(s.longitude),Ae(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Lg(t.arrayValue,e.arrayValue);case 10:return function(s,o){var l,u,d,f;const m=s.fields||{},y=o.fields||{},R=(l=m.value)===null||l===void 0?void 0:l.arrayValue,C=(u=y.value)===null||u===void 0?void 0:u.arrayValue,b=ae(((d=R==null?void 0:R.values)===null||d===void 0?void 0:d.length)||0,((f=C==null?void 0:C.values)===null||f===void 0?void 0:f.length)||0);return b!==0?b:Lg(R,C)}(t.mapValue,e.mapValue);case 11:return function(s,o){if(s===xa.mapValue&&o===xa.mapValue)return 0;if(s===xa.mapValue)return 1;if(o===xa.mapValue)return-1;const l=s.fields||{},u=Object.keys(l),d=o.fields||{},f=Object.keys(d);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const y=ae(u[m],f[m]);if(y!==0)return y;const R=Wi(l[u[m]],d[f[m]]);if(R!==0)return R}return ae(u.length,f.length)}(t.mapValue,e.mapValue);default:throw Y()}}function Vg(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return ae(t,e);const n=fr(t),r=fr(e),i=ae(n.seconds,r.seconds);return i!==0?i:ae(n.nanos,r.nanos)}function Lg(t,e){const n=t.values||[],r=e.values||[];for(let i=0;i<n.length&&i<r.length;++i){const s=Wi(n[i],r[i]);if(s)return s}return ae(n.length,r.length)}function qi(t){return zd(t)}function zd(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=fr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Hr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return G.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",i=!0;for(const s of n.values||[])i?i=!1:r+=",",r+=zd(s);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${zd(n.fields[o])}`;return i+"}"}(t.mapValue):Y()}function Mg(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function Bd(t){return!!t&&"integerValue"in t}function yf(t){return!!t&&"arrayValue"in t}function jg(t){return!!t&&"nullValue"in t}function Fg(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function Ya(t){return!!t&&"mapValue"in t}function dC(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="__vector__"}function Hs(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Jr(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=Hs(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Hs(t.arrayValue.values[n]);return e}return Object.assign({},t)}function hC(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ft{constructor(e){this.value=e}static empty(){return new ft({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!Ya(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Hs(n)}setAll(e){let n=$e.emptyPath(),r={},i=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const u=this.getFieldsMap(n);this.applyChanges(u,r,i),r={},i=[],n=l.popLast()}o?r[l.lastSegment()]=Hs(o):i.push(l.lastSegment())});const s=this.getFieldsMap(n);this.applyChanges(s,r,i)}delete(e){const n=this.field(e.popLast());Ya(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return an(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=n.mapValue.fields[e.get(r)];Ya(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=i),n=i}return n.mapValue.fields}applyChanges(e,n,r){Jr(n,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new ft(Hs(this.value))}}function W0(t){const e=[];return Jr(t.fields,(n,r)=>{const i=new $e([n]);if(Ya(r)){const s=W0(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new Et(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(e,n,r,i,s,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=l}static newInvalidDocument(e){return new nt(e,0,X.min(),X.min(),X.min(),ft.empty(),0)}static newFoundDocument(e,n,r,i){return new nt(e,1,n,X.min(),r,i,0)}static newNoDocument(e,n){return new nt(e,2,n,X.min(),X.min(),ft.empty(),0)}static newUnknownDocument(e,n){return new nt(e,3,n,X.min(),X.min(),ft.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(X.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ft.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ft.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=X.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof nt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new nt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ol{constructor(e,n){this.position=e,this.inclusive=n}}function Ug(t,e,n){let r=0;for(let i=0;i<t.position.length;i++){const s=e[i],o=t.position[i];if(s.field.isKeyField()?r=G.comparator(G.fromName(o.referenceValue),n.key):r=Wi(o,n.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function zg(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!an(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vl{constructor(e,n="asc"){this.field=e,this.dir=n}}function fC(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q0{}class xe extends q0{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new mC(e,n,r):n==="array-contains"?new vC(e,r):n==="in"?new _C(e,r):n==="not-in"?new wC(e,r):n==="array-contains-any"?new EC(e,r):new xe(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new gC(e,r):new yC(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(Wi(n,this.value)):n!==null&&Kr(this.value)===Kr(n)&&this.matchesComparison(Wi(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Y()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Gt extends q0{constructor(e,n){super(),this.filters=e,this.op=n,this.ae=null}static create(e,n){return new Gt(e,n)}matches(e){return H0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function H0(t){return t.op==="and"}function K0(t){return pC(t)&&H0(t)}function pC(t){for(const e of t.filters)if(e instanceof Gt)return!1;return!0}function $d(t){if(t instanceof xe)return t.field.canonicalString()+t.op.toString()+qi(t.value);if(K0(t))return t.filters.map(e=>$d(e)).join(",");{const e=t.filters.map(n=>$d(n)).join(",");return`${t.op}(${e})`}}function G0(t,e){return t instanceof xe?function(r,i){return i instanceof xe&&r.op===i.op&&r.field.isEqual(i.field)&&an(r.value,i.value)}(t,e):t instanceof Gt?function(r,i){return i instanceof Gt&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,l)=>s&&G0(o,i.filters[l]),!0):!1}(t,e):void Y()}function Q0(t){return t instanceof xe?function(n){return`${n.field.canonicalString()} ${n.op} ${qi(n.value)}`}(t):t instanceof Gt?function(n){return n.op.toString()+" {"+n.getFilters().map(Q0).join(" ,")+"}"}(t):"Filter"}class mC extends xe{constructor(e,n,r){super(e,n,r),this.key=G.fromName(r.referenceValue)}matches(e){const n=G.comparator(e.key,this.key);return this.matchesComparison(n)}}class gC extends xe{constructor(e,n){super(e,"in",n),this.keys=Y0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class yC extends xe{constructor(e,n){super(e,"not-in",n),this.keys=Y0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function Y0(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>G.fromName(r.referenceValue))}class vC extends xe{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return yf(n)&&_o(n.arrayValue,this.value)}}class _C extends xe{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&_o(this.value.arrayValue,n)}}class wC extends xe{constructor(e,n){super(e,"not-in",n)}matches(e){if(_o(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!_o(this.value.arrayValue,n)}}class EC extends xe{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!yf(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>_o(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TC{constructor(e,n=null,r=[],i=[],s=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=l,this.ue=null}}function Bg(t,e=null,n=[],r=[],i=null,s=null,o=null){return new TC(t,e,n,r,i,s,o)}function vf(t){const e=J(t);if(e.ue===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>$d(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),cu(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>qi(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>qi(r)).join(",")),e.ue=n}return e.ue}function _f(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!fC(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!G0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!zg(t.startAt,e.startAt)&&zg(t.endAt,e.endAt)}function Wd(t){return G.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mo{constructor(e,n=null,r=[],i=[],s=null,o="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=l,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function IC(t,e,n,r,i,s,o,l){return new Mo(t,e,n,r,i,s,o,l)}function du(t){return new Mo(t)}function $g(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function X0(t){return t.collectionGroup!==null}function Ks(t){const e=J(t);if(e.ce===null){e.ce=[];const n=new Set;for(const s of e.explicitOrderBy)e.ce.push(s),n.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new qe($e.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(d=>{d.isInequality()&&(l=l.add(d.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.ce.push(new Vl(s,r))}),n.has($e.keyField().canonicalString())||e.ce.push(new Vl($e.keyField(),r))}return e.ce}function sn(t){const e=J(t);return e.le||(e.le=SC(e,Ks(t))),e.le}function SC(t,e){if(t.limitType==="F")return Bg(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new Vl(i.field,s)});const n=t.endAt?new Ol(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new Ol(t.startAt.position,t.startAt.inclusive):null;return Bg(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function qd(t,e){const n=t.filters.concat([e]);return new Mo(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function Hd(t,e,n){return new Mo(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function hu(t,e){return _f(sn(t),sn(e))&&t.limitType===e.limitType}function J0(t){return`${vf(sn(t))}|lt:${t.limitType}`}function ai(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(i=>Q0(i)).join(", ")}]`),cu(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(i=>qi(i)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(i=>qi(i)).join(",")),`Target(${r})`}(sn(t))}; limitType=${t.limitType})`}function fu(t,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):G.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(t,e)&&function(r,i){for(const s of Ks(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(t,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(t,e)&&function(r,i){return!(r.startAt&&!function(o,l,u){const d=Ug(o,l,u);return o.inclusive?d<=0:d<0}(r.startAt,Ks(r),i)||r.endAt&&!function(o,l,u){const d=Ug(o,l,u);return o.inclusive?d>=0:d>0}(r.endAt,Ks(r),i))}(t,e)}function AC(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function Z0(t){return(e,n)=>{let r=!1;for(const i of Ks(t)){const s=RC(i,e,n);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function RC(t,e,n){const r=t.field.isKeyField()?G.comparator(e.key,n.key):function(s,o,l){const u=o.data.field(s),d=l.data.field(s);return u!==null&&d!==null?Wi(u,d):Y()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return Y()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,n]);i.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[n]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Jr(this.inner,(n,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return B0(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kC=new Te(G.comparator);function xn(){return kC}const ew=new Te(G.comparator);function Ds(...t){let e=ew;for(const n of t)e=e.insert(n.key,n);return e}function tw(t){let e=ew;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Dr(){return Gs()}function nw(){return Gs()}function Gs(){return new ts(t=>t.toString(),(t,e)=>t.isEqual(e))}const CC=new Te(G.comparator),PC=new qe(G.comparator);function te(...t){let e=PC;for(const n of t)e=e.add(n);return e}const xC=new qe(ae);function bC(){return xC}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wf(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Dl(e)?"-0":e}}function rw(t){return{integerValue:""+t}}function NC(t,e){return lC(e)?rw(e):wf(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pu{constructor(){this._=void 0}}function DC(t,e,n){return t instanceof wo?function(i,s){const o={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&mf(s)&&(s=gf(s)),s&&(o.fields.__previous_value__=s),{mapValue:o}}(n,e):t instanceof Eo?sw(t,e):t instanceof To?ow(t,e):function(i,s){const o=iw(i,s),l=Wg(o)+Wg(i.Pe);return Bd(o)&&Bd(i.Pe)?rw(l):wf(i.serializer,l)}(t,e)}function OC(t,e,n){return t instanceof Eo?sw(t,e):t instanceof To?ow(t,e):n}function iw(t,e){return t instanceof Ll?function(r){return Bd(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class wo extends pu{}class Eo extends pu{constructor(e){super(),this.elements=e}}function sw(t,e){const n=aw(e);for(const r of t.elements)n.some(i=>an(i,r))||n.push(r);return{arrayValue:{values:n}}}class To extends pu{constructor(e){super(),this.elements=e}}function ow(t,e){let n=aw(e);for(const r of t.elements)n=n.filter(i=>!an(i,r));return{arrayValue:{values:n}}}class Ll extends pu{constructor(e,n){super(),this.serializer=e,this.Pe=n}}function Wg(t){return Ae(t.integerValue||t.doubleValue)}function aw(t){return yf(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VC{constructor(e,n){this.field=e,this.transform=n}}function LC(t,e){return t.field.isEqual(e.field)&&function(r,i){return r instanceof Eo&&i instanceof Eo||r instanceof To&&i instanceof To?$i(r.elements,i.elements,an):r instanceof Ll&&i instanceof Ll?an(r.Pe,i.Pe):r instanceof wo&&i instanceof wo}(t.transform,e.transform)}class MC{constructor(e,n){this.version=e,this.transformResults=n}}class Ot{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Ot}static exists(e){return new Ot(void 0,e)}static updateTime(e){return new Ot(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Xa(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class mu{}function lw(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Ef(t.key,Ot.none()):new jo(t.key,t.data,Ot.none());{const n=t.data,r=ft.empty();let i=new qe($e.comparator);for(let s of e.fields)if(!i.has(s)){let o=n.field(s);o===null&&s.length>1&&(s=s.popLast(),o=n.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new Er(t.key,r,new Et(i.toArray()),Ot.none())}}function jC(t,e,n){t instanceof jo?function(i,s,o){const l=i.value.clone(),u=Hg(i.fieldTransforms,s,o.transformResults);l.setAll(u),s.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof Er?function(i,s,o){if(!Xa(i.precondition,s))return void s.convertToUnknownDocument(o.version);const l=Hg(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(uw(i)),u.setAll(l),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(t,e,n):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function Qs(t,e,n,r){return t instanceof jo?function(s,o,l,u){if(!Xa(s.precondition,o))return l;const d=s.value.clone(),f=Kg(s.fieldTransforms,u,o);return d.setAll(f),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),null}(t,e,n,r):t instanceof Er?function(s,o,l,u){if(!Xa(s.precondition,o))return l;const d=Kg(s.fieldTransforms,u,o),f=o.data;return f.setAll(uw(s)),f.setAll(d),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(m=>m.field))}(t,e,n,r):function(s,o,l){return Xa(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function FC(t,e){let n=null;for(const r of t.fieldTransforms){const i=e.data.field(r.field),s=iw(r.transform,i||null);s!=null&&(n===null&&(n=ft.empty()),n.set(r.field,s))}return n||null}function qg(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&$i(r,i,(s,o)=>LC(s,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class jo extends mu{constructor(e,n,r,i=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Er extends mu{constructor(e,n,r,i,s=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function uw(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function Hg(t,e,n){const r=new Map;de(t.length===n.length);for(let i=0;i<n.length;i++){const s=t[i],o=s.transform,l=e.data.field(s.field);r.set(s.field,OC(o,l,n[i]))}return r}function Kg(t,e,n){const r=new Map;for(const i of t){const s=i.transform,o=n.data.field(i.field);r.set(i.field,DC(s,o,e))}return r}class Ef extends mu{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class UC extends mu{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zC{constructor(e,n,r,i){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&jC(s,e,r[i])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=Qs(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=Qs(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=nw();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let l=this.applyToLocalView(o,s.mutatedFields);l=n.has(i.key)?null:l;const u=lw(o,l);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(X.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),te())}isEqual(e){return this.batchId===e.batchId&&$i(this.mutations,e.mutations,(n,r)=>qg(n,r))&&$i(this.baseMutations,e.baseMutations,(n,r)=>qg(n,r))}}class Tf{constructor(e,n,r,i){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=i}static from(e,n,r){de(e.mutations.length===r.length);let i=function(){return CC}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new Tf(e,n,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BC{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $C{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ce,ie;function WC(t){switch(t){default:return Y();case M.CANCELLED:case M.UNKNOWN:case M.DEADLINE_EXCEEDED:case M.RESOURCE_EXHAUSTED:case M.INTERNAL:case M.UNAVAILABLE:case M.UNAUTHENTICATED:return!1;case M.INVALID_ARGUMENT:case M.NOT_FOUND:case M.ALREADY_EXISTS:case M.PERMISSION_DENIED:case M.FAILED_PRECONDITION:case M.ABORTED:case M.OUT_OF_RANGE:case M.UNIMPLEMENTED:case M.DATA_LOSS:return!0}}function cw(t){if(t===void 0)return Pn("GRPC error has no .code"),M.UNKNOWN;switch(t){case Ce.OK:return M.OK;case Ce.CANCELLED:return M.CANCELLED;case Ce.UNKNOWN:return M.UNKNOWN;case Ce.DEADLINE_EXCEEDED:return M.DEADLINE_EXCEEDED;case Ce.RESOURCE_EXHAUSTED:return M.RESOURCE_EXHAUSTED;case Ce.INTERNAL:return M.INTERNAL;case Ce.UNAVAILABLE:return M.UNAVAILABLE;case Ce.UNAUTHENTICATED:return M.UNAUTHENTICATED;case Ce.INVALID_ARGUMENT:return M.INVALID_ARGUMENT;case Ce.NOT_FOUND:return M.NOT_FOUND;case Ce.ALREADY_EXISTS:return M.ALREADY_EXISTS;case Ce.PERMISSION_DENIED:return M.PERMISSION_DENIED;case Ce.FAILED_PRECONDITION:return M.FAILED_PRECONDITION;case Ce.ABORTED:return M.ABORTED;case Ce.OUT_OF_RANGE:return M.OUT_OF_RANGE;case Ce.UNIMPLEMENTED:return M.UNIMPLEMENTED;case Ce.DATA_LOSS:return M.DATA_LOSS;default:return Y()}}(ie=Ce||(Ce={}))[ie.OK=0]="OK",ie[ie.CANCELLED=1]="CANCELLED",ie[ie.UNKNOWN=2]="UNKNOWN",ie[ie.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ie[ie.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ie[ie.NOT_FOUND=5]="NOT_FOUND",ie[ie.ALREADY_EXISTS=6]="ALREADY_EXISTS",ie[ie.PERMISSION_DENIED=7]="PERMISSION_DENIED",ie[ie.UNAUTHENTICATED=16]="UNAUTHENTICATED",ie[ie.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ie[ie.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ie[ie.ABORTED=10]="ABORTED",ie[ie.OUT_OF_RANGE=11]="OUT_OF_RANGE",ie[ie.UNIMPLEMENTED=12]="UNIMPLEMENTED",ie[ie.INTERNAL=13]="INTERNAL",ie[ie.UNAVAILABLE=14]="UNAVAILABLE",ie[ie.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qC(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HC=new Lr([4294967295,4294967295],0);function Gg(t){const e=qC().encode(t),n=new O0;return n.update(e),new Uint8Array(n.digest())}function Qg(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Lr([n,r],0),new Lr([i,s],0)]}class If{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new Os(`Invalid padding: ${n}`);if(r<0)throw new Os(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Os(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new Os(`Invalid padding when bitmap length is 0: ${n}`);this.Ie=8*e.length-n,this.Te=Lr.fromNumber(this.Ie)}Ee(e,n,r){let i=e.add(n.multiply(Lr.fromNumber(r)));return i.compare(HC)===1&&(i=new Lr([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const n=Gg(e),[r,i]=Qg(n);for(let s=0;s<this.hashCount;s++){const o=this.Ee(r,i,s);if(!this.de(o))return!1}return!0}static create(e,n,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new If(s,i,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.Ie===0)return;const n=Gg(e),[r,i]=Qg(n);for(let s=0;s<this.hashCount;s++){const o=this.Ee(r,i,s);this.Ae(o)}}Ae(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class Os extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gu{constructor(e,n,r,i,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const i=new Map;return i.set(e,Fo.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new gu(X.min(),i,new Te(ae),xn(),te())}}class Fo{constructor(e,n,r,i,s){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Fo(r,n,te(),te(),te())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ja{constructor(e,n,r,i){this.Re=e,this.removedTargetIds=n,this.key=r,this.Ve=i}}class dw{constructor(e,n){this.targetId=e,this.me=n}}class hw{constructor(e,n,r=Ke.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=i}}class Yg{constructor(){this.fe=0,this.ge=Jg(),this.pe=Ke.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=te(),n=te(),r=te();return this.ge.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:n=n.add(i);break;case 1:r=r.add(i);break;default:Y()}}),new Fo(this.pe,this.ye,e,n,r)}Ce(){this.we=!1,this.ge=Jg()}Fe(e,n){this.we=!0,this.ge=this.ge.insert(e,n)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,de(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class KC{constructor(e){this.Le=e,this.Be=new Map,this.ke=xn(),this.qe=Xg(),this.Qe=new Te(ae)}Ke(e){for(const n of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(n,e.Ve):this.Ue(n,e.key,e.Ve);for(const n of e.removedTargetIds)this.Ue(n,e.key,e.Ve)}We(e){this.forEachTarget(e,n=>{const r=this.Ge(n);switch(e.state){case 0:this.ze(n)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(n);break;case 3:this.ze(n)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(n)&&(this.je(n),r.De(e.resumeToken));break;default:Y()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Be.forEach((r,i)=>{this.ze(i)&&n(i)})}He(e){const n=e.targetId,r=e.me.count,i=this.Je(n);if(i){const s=i.target;if(Wd(s))if(r===0){const o=new G(s.path);this.Ue(n,o,nt.newNoDocument(o,X.min()))}else de(r===1);else{const o=this.Ye(n);if(o!==r){const l=this.Ze(e),u=l?this.Xe(l,e,o):1;if(u!==0){this.je(n);const d=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(n,d)}}}}}Ze(e){const n=e.me.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=n;let o,l;try{o=Hr(r).toUint8Array()}catch(u){if(u instanceof $0)return Bi("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new If(o,i,s)}catch(u){return Bi(u instanceof Os?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.Ie===0?null:l}Xe(e,n,r){return n.me.count===r-this.nt(e,n.targetId)?0:2}nt(e,n){const r=this.Le.getRemoteKeysForTarget(n);let i=0;return r.forEach(s=>{const o=this.Le.tt(),l=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.Ue(n,s,null),i++)}),i}rt(e){const n=new Map;this.Be.forEach((s,o)=>{const l=this.Je(o);if(l){if(s.current&&Wd(l.target)){const u=new G(l.target.path);this.ke.get(u)!==null||this.it(o,u)||this.Ue(o,u,nt.newNoDocument(u,e))}s.be&&(n.set(o,s.ve()),s.Ce())}});let r=te();this.qe.forEach((s,o)=>{let l=!0;o.forEachWhile(u=>{const d=this.Je(u);return!d||d.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(s))}),this.ke.forEach((s,o)=>o.setReadTime(e));const i=new gu(e,n,this.Qe,this.ke,r);return this.ke=xn(),this.qe=Xg(),this.Qe=new Te(ae),i}$e(e,n){if(!this.ze(e))return;const r=this.it(e,n.key)?2:0;this.Ge(e).Fe(n.key,r),this.ke=this.ke.insert(n.key,n),this.qe=this.qe.insert(n.key,this.st(n.key).add(e))}Ue(e,n,r){if(!this.ze(e))return;const i=this.Ge(e);this.it(e,n)?i.Fe(n,1):i.Me(n),this.qe=this.qe.insert(n,this.st(n).delete(e)),r&&(this.ke=this.ke.insert(n,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const n=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let n=this.Be.get(e);return n||(n=new Yg,this.Be.set(e,n)),n}st(e){let n=this.qe.get(e);return n||(n=new qe(ae),this.qe=this.qe.insert(e,n)),n}ze(e){const n=this.Je(e)!==null;return n||H("WatchChangeAggregator","Detected inactive target",e),n}Je(e){const n=this.Be.get(e);return n&&n.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Yg),this.Le.getRemoteKeysForTarget(e).forEach(n=>{this.Ue(e,n,null)})}it(e,n){return this.Le.getRemoteKeysForTarget(e).has(n)}}function Xg(){return new Te(G.comparator)}function Jg(){return new Te(G.comparator)}const GC={asc:"ASCENDING",desc:"DESCENDING"},QC={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},YC={and:"AND",or:"OR"};class XC{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function Kd(t,e){return t.useProto3Json||cu(e)?e:{value:e}}function Ml(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function fw(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function JC(t,e){return Ml(t,e.toTimestamp())}function on(t){return de(!!t),X.fromTimestamp(function(n){const r=fr(n);return new Ve(r.seconds,r.nanos)}(t))}function Sf(t,e){return Gd(t,e).canonicalString()}function Gd(t,e){const n=function(i){return new ge(["projects",i.projectId,"databases",i.database])}(t).child("documents");return e===void 0?n:n.child(e)}function pw(t){const e=ge.fromString(t);return de(_w(e)),e}function Qd(t,e){return Sf(t.databaseId,e.path)}function Nc(t,e){const n=pw(e);if(n.get(1)!==t.databaseId.projectId)throw new q(M.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new q(M.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new G(gw(n))}function mw(t,e){return Sf(t.databaseId,e)}function ZC(t){const e=pw(t);return e.length===4?ge.emptyPath():gw(e)}function Yd(t){return new ge(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function gw(t){return de(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function Zg(t,e,n){return{name:Qd(t,e),fields:n.value.mapValue.fields}}function eP(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:Y()}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(d,f){return d.useProto3Json?(de(f===void 0||typeof f=="string"),Ke.fromBase64String(f||"")):(de(f===void 0||f instanceof Buffer||f instanceof Uint8Array),Ke.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(d){const f=d.code===void 0?M.UNKNOWN:cw(d.code);return new q(f,d.message||"")}(o);n=new hw(r,i,s,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Nc(t,r.document.name),s=on(r.document.updateTime),o=r.document.createTime?on(r.document.createTime):X.min(),l=new ft({mapValue:{fields:r.document.fields}}),u=nt.newFoundDocument(i,s,o,l),d=r.targetIds||[],f=r.removedTargetIds||[];n=new Ja(d,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Nc(t,r.document),s=r.readTime?on(r.readTime):X.min(),o=nt.newNoDocument(i,s),l=r.removedTargetIds||[];n=new Ja([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Nc(t,r.document),s=r.removedTargetIds||[];n=new Ja([],s,i,null)}else{if(!("filter"in e))return Y();{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new $C(i,s),l=r.targetId;n=new dw(l,o)}}return n}function tP(t,e){let n;if(e instanceof jo)n={update:Zg(t,e.key,e.value)};else if(e instanceof Ef)n={delete:Qd(t,e.key)};else if(e instanceof Er)n={update:Zg(t,e.key,e.data),updateMask:cP(e.fieldMask)};else{if(!(e instanceof UC))return Y();n={verify:Qd(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const l=o.transform;if(l instanceof wo)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Eo)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof To)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Ll)return{fieldPath:o.field.canonicalString(),increment:l.Pe};throw Y()}(0,r))),e.precondition.isNone||(n.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:JC(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:Y()}(t,e.precondition)),n}function nP(t,e){return t&&t.length>0?(de(e!==void 0),t.map(n=>function(i,s){let o=i.updateTime?on(i.updateTime):on(s);return o.isEqual(X.min())&&(o=on(s)),new MC(o,i.transformResults||[])}(n,e))):[]}function rP(t,e){return{documents:[mw(t,e.path)]}}function iP(t,e){const n={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=mw(t,i);const s=function(d){if(d.length!==0)return vw(Gt.create(d,"and"))}(e.filters);s&&(n.structuredQuery.where=s);const o=function(d){if(d.length!==0)return d.map(f=>function(y){return{field:li(y.field),direction:aP(y.dir)}}(f))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=Kd(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:n,parent:i}}function sP(t){let e=ZC(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let i=null;if(r>0){de(r===1);const f=n.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(m){const y=yw(m);return y instanceof Gt&&K0(y)?y.getFilters():[y]}(n.where));let o=[];n.orderBy&&(o=function(m){return m.map(y=>function(C){return new Vl(ui(C.field),function(L){switch(L){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(y))}(n.orderBy));let l=null;n.limit&&(l=function(m){let y;return y=typeof m=="object"?m.value:m,cu(y)?null:y}(n.limit));let u=null;n.startAt&&(u=function(m){const y=!!m.before,R=m.values||[];return new Ol(R,y)}(n.startAt));let d=null;return n.endAt&&(d=function(m){const y=!m.before,R=m.values||[];return new Ol(R,y)}(n.endAt)),IC(e,i,o,s,l,"F",u,d)}function oP(t,e){const n=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Y()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function yw(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=ui(n.unaryFilter.field);return xe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=ui(n.unaryFilter.field);return xe.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=ui(n.unaryFilter.field);return xe.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=ui(n.unaryFilter.field);return xe.create(o,"!=",{nullValue:"NULL_VALUE"});default:return Y()}}(t):t.fieldFilter!==void 0?function(n){return xe.create(ui(n.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return Y()}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Gt.create(n.compositeFilter.filters.map(r=>yw(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return Y()}}(n.compositeFilter.op))}(t):Y()}function aP(t){return GC[t]}function lP(t){return QC[t]}function uP(t){return YC[t]}function li(t){return{fieldPath:t.canonicalString()}}function ui(t){return $e.fromServerFormat(t.fieldPath)}function vw(t){return t instanceof xe?function(n){if(n.op==="=="){if(Fg(n.value))return{unaryFilter:{field:li(n.field),op:"IS_NAN"}};if(jg(n.value))return{unaryFilter:{field:li(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Fg(n.value))return{unaryFilter:{field:li(n.field),op:"IS_NOT_NAN"}};if(jg(n.value))return{unaryFilter:{field:li(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:li(n.field),op:lP(n.op),value:n.value}}}(t):t instanceof Gt?function(n){const r=n.getFilters().map(i=>vw(i));return r.length===1?r[0]:{compositeFilter:{op:uP(n.op),filters:r}}}(t):Y()}function cP(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function _w(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn{constructor(e,n,r,i,s=X.min(),o=X.min(),l=Ke.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new Yn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new Yn(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Yn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Yn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dP{constructor(e){this.ct=e}}function hP(t){const e=sP({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Hd(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fP{constructor(){this.un=new pP}addToCollectionParentIndex(e,n){return this.un.add(n),F.resolve()}getCollectionParents(e,n){return F.resolve(this.un.getEntries(n))}addFieldIndex(e,n){return F.resolve()}deleteFieldIndex(e,n){return F.resolve()}deleteAllFieldIndexes(e){return F.resolve()}createTargetIndexes(e,n){return F.resolve()}getDocumentsMatchingTarget(e,n){return F.resolve(null)}getIndexType(e,n){return F.resolve(0)}getFieldIndexes(e,n){return F.resolve([])}getNextCollectionGroupToUpdate(e){return F.resolve(null)}getMinOffset(e,n){return F.resolve(hr.min())}getMinOffsetFromCollectionGroup(e,n){return F.resolve(hr.min())}updateCollectionGroup(e,n,r){return F.resolve()}updateIndexEntries(e,n){return F.resolve()}}class pP{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n]||new qe(ge.comparator),s=!i.has(r);return this.index[n]=i.add(r),s}has(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n];return i&&i.has(r)}getEntries(e){return(this.index[e]||new qe(ge.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new Hi(0)}static kn(){return new Hi(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mP{constructor(){this.changes=new ts(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,nt.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?F.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gP{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yP{constructor(e,n,r,i){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,n))).next(i=>(r!==null&&Qs(r.mutation,i,Et.empty(),Ve.now()),i))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,te()).next(()=>r))}getLocalViewOfDocuments(e,n,r=te()){const i=Dr();return this.populateOverlays(e,i,n).next(()=>this.computeViews(e,n,i,r).next(s=>{let o=Ds();return s.forEach((l,u)=>{o=o.insert(l,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=Dr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,te()))}populateOverlays(e,n,r){const i=[];return r.forEach(s=>{n.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,i){let s=xn();const o=Gs(),l=function(){return Gs()}();return n.forEach((u,d)=>{const f=r.get(d.key);i.has(d.key)&&(f===void 0||f.mutation instanceof Er)?s=s.insert(d.key,d):f!==void 0?(o.set(d.key,f.mutation.getFieldMask()),Qs(f.mutation,d,f.mutation.getFieldMask(),Ve.now())):o.set(d.key,Et.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((d,f)=>o.set(d,f)),n.forEach((d,f)=>{var m;return l.set(d,new gP(f,(m=o.get(d))!==null&&m!==void 0?m:null))}),l))}recalculateAndSaveOverlays(e,n){const r=Gs();let i=new Te((o,l)=>o-l),s=te();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(u=>{const d=n.get(u);if(d===null)return;let f=r.get(u)||Et.empty();f=l.applyToLocalView(d,f),r.set(u,f);const m=(i.get(l.batchId)||te()).add(u);i=i.insert(l.batchId,m)})}).next(()=>{const o=[],l=i.getReverseIterator();for(;l.hasNext();){const u=l.getNext(),d=u.key,f=u.value,m=nw();f.forEach(y=>{if(!s.has(y)){const R=lw(n.get(y),r.get(y));R!==null&&m.set(y,R),s=s.add(y)}}),o.push(this.documentOverlayCache.saveOverlays(e,d,m))}return F.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,i){return function(o){return G.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):X0(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,i):this.getDocumentsMatchingCollectionQuery(e,n,r,i)}getNextDocuments(e,n,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,i-s.size):F.resolve(Dr());let l=-1,u=s;return o.next(d=>F.forEach(d,(f,m)=>(l<m.largestBatchId&&(l=m.largestBatchId),s.get(f)?F.resolve():this.remoteDocumentCache.getEntry(e,f).next(y=>{u=u.insert(f,y)}))).next(()=>this.populateOverlays(e,d,s)).next(()=>this.computeViews(e,u,d,te())).next(f=>({batchId:l,changes:tw(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new G(n)).next(r=>{let i=Ds();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,n,r,i){const s=n.collectionGroup;let o=Ds();return this.indexManager.getCollectionParents(e,s).next(l=>F.forEach(l,u=>{const d=function(m,y){return new Mo(y,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(n,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,d,r,i).next(f=>{f.forEach((m,y)=>{o=o.insert(m,y)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,s,i))).next(o=>{s.forEach((u,d)=>{const f=d.getKey();o.get(f)===null&&(o=o.insert(f,nt.newInvalidDocument(f)))});let l=Ds();return o.forEach((u,d)=>{const f=s.get(u);f!==void 0&&Qs(f.mutation,d,Et.empty(),Ve.now()),fu(n,d)&&(l=l.insert(u,d))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vP{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,n){return F.resolve(this.hr.get(n))}saveBundleMetadata(e,n){return this.hr.set(n.id,function(i){return{id:i.id,version:i.version,createTime:on(i.createTime)}}(n)),F.resolve()}getNamedQuery(e,n){return F.resolve(this.Pr.get(n))}saveNamedQuery(e,n){return this.Pr.set(n.name,function(i){return{name:i.name,query:hP(i.bundledQuery),readTime:on(i.readTime)}}(n)),F.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _P{constructor(){this.overlays=new Te(G.comparator),this.Ir=new Map}getOverlay(e,n){return F.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Dr();return F.forEach(n,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((i,s)=>{this.ht(e,n,s)}),F.resolve()}removeOverlaysForBatchId(e,n,r){const i=this.Ir.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Ir.delete(r)),F.resolve()}getOverlaysForCollection(e,n,r){const i=Dr(),s=n.length+1,o=new G(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const u=l.getNext().value,d=u.getKey();if(!n.isPrefixOf(d.path))break;d.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return F.resolve(i)}getOverlaysForCollectionGroup(e,n,r,i){let s=new Te((d,f)=>d-f);const o=this.overlays.getIterator();for(;o.hasNext();){const d=o.getNext().value;if(d.getKey().getCollectionGroup()===n&&d.largestBatchId>r){let f=s.get(d.largestBatchId);f===null&&(f=Dr(),s=s.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const l=Dr(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((d,f)=>l.set(d,f)),!(l.size()>=i)););return F.resolve(l)}ht(e,n,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.Ir.get(i.largestBatchId).delete(r.key);this.Ir.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new BC(n,r));let s=this.Ir.get(n);s===void 0&&(s=te(),this.Ir.set(n,s)),this.Ir.set(n,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wP{constructor(){this.sessionToken=Ke.EMPTY_BYTE_STRING}getSessionToken(e){return F.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,F.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Af{constructor(){this.Tr=new qe(Le.Er),this.dr=new qe(Le.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,n){const r=new Le(e,n);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Vr(new Le(e,n))}mr(e,n){e.forEach(r=>this.removeReference(r,n))}gr(e){const n=new G(new ge([])),r=new Le(n,e),i=new Le(n,e+1),s=[];return this.dr.forEachInRange([r,i],o=>{this.Vr(o),s.push(o.key)}),s}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const n=new G(new ge([])),r=new Le(n,e),i=new Le(n,e+1);let s=te();return this.dr.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const n=new Le(e,0),r=this.Tr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class Le{constructor(e,n){this.key=e,this.wr=n}static Er(e,n){return G.comparator(e.key,n.key)||ae(e.wr,n.wr)}static Ar(e,n){return ae(e.wr,n.wr)||G.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EP{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Sr=1,this.br=new qe(Le.Er)}checkEmpty(e){return F.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,i){const s=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new zC(s,n,r,i);this.mutationQueue.push(o);for(const l of i)this.br=this.br.add(new Le(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return F.resolve(o)}lookupMutationBatch(e,n){return F.resolve(this.Dr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,i=this.vr(r),s=i<0?0:i;return F.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return F.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return F.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new Le(n,0),i=new Le(n,Number.POSITIVE_INFINITY),s=[];return this.br.forEachInRange([r,i],o=>{const l=this.Dr(o.wr);s.push(l)}),F.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new qe(ae);return n.forEach(i=>{const s=new Le(i,0),o=new Le(i,Number.POSITIVE_INFINITY);this.br.forEachInRange([s,o],l=>{r=r.add(l.wr)})}),F.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,i=r.length+1;let s=r;G.isDocumentKey(s)||(s=s.child(""));const o=new Le(new G(s),0);let l=new qe(ae);return this.br.forEachWhile(u=>{const d=u.key.path;return!!r.isPrefixOf(d)&&(d.length===i&&(l=l.add(u.wr)),!0)},o),F.resolve(this.Cr(l))}Cr(e){const n=[];return e.forEach(r=>{const i=this.Dr(r);i!==null&&n.push(i)}),n}removeMutationBatch(e,n){de(this.Fr(n.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return F.forEach(n.mutations,i=>{const s=new Le(i.key,n.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,n){const r=new Le(n,0),i=this.br.firstAfterOrEqual(r);return F.resolve(n.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,F.resolve()}Fr(e,n){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const n=this.vr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TP{constructor(e){this.Mr=e,this.docs=function(){return new Te(G.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,i=this.docs.get(r),s=i?i.size:0,o=this.Mr(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return F.resolve(r?r.document.mutableCopy():nt.newInvalidDocument(n))}getEntries(e,n){let r=xn();return n.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():nt.newInvalidDocument(i))}),F.resolve(r)}getDocumentsMatchingQuery(e,n,r,i){let s=xn();const o=n.path,l=new G(o.child("")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){const{key:d,value:{document:f}}=u.getNext();if(!o.isPrefixOf(d.path))break;d.path.length>o.length+1||iC(rC(f),r)<=0||(i.has(f.key)||fu(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return F.resolve(s)}getAllFromCollectionGroup(e,n,r,i){Y()}Or(e,n){return F.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new IP(this)}getSize(e){return F.resolve(this.size)}}class IP extends mP{constructor(e){super(),this.cr=e}applyChanges(e){const n=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?n.push(this.cr.addEntry(e,i)):this.cr.removeEntry(r)}),F.waitFor(n)}getFromCache(e,n){return this.cr.getEntry(e,n)}getAllFromCache(e,n){return this.cr.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SP{constructor(e){this.persistence=e,this.Nr=new ts(n=>vf(n),_f),this.lastRemoteSnapshotVersion=X.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Af,this.targetCount=0,this.kr=Hi.Bn()}forEachTarget(e,n){return this.Nr.forEach((r,i)=>n(i)),F.resolve()}getLastRemoteSnapshotVersion(e){return F.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return F.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),F.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.Lr&&(this.Lr=n),F.resolve()}Kn(e){this.Nr.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.kr=new Hi(n),this.highestTargetId=n),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,n){return this.Kn(n),this.targetCount+=1,F.resolve()}updateTargetData(e,n){return this.Kn(n),F.resolve()}removeTargetData(e,n){return this.Nr.delete(n.target),this.Br.gr(n.targetId),this.targetCount-=1,F.resolve()}removeTargets(e,n,r){let i=0;const s=[];return this.Nr.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.Nr.delete(o),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),F.waitFor(s).next(()=>i)}getTargetCount(e){return F.resolve(this.targetCount)}getTargetData(e,n){const r=this.Nr.get(n)||null;return F.resolve(r)}addMatchingKeys(e,n,r){return this.Br.Rr(n,r),F.resolve()}removeMatchingKeys(e,n,r){this.Br.mr(n,r);const i=this.persistence.referenceDelegate,s=[];return i&&n.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),F.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.Br.gr(n),F.resolve()}getMatchingKeysForTargetId(e,n){const r=this.Br.yr(n);return F.resolve(r)}containsKey(e,n){return F.resolve(this.Br.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AP{constructor(e,n){this.qr={},this.overlays={},this.Qr=new pf(0),this.Kr=!1,this.Kr=!0,this.$r=new wP,this.referenceDelegate=e(this),this.Ur=new SP(this),this.indexManager=new fP,this.remoteDocumentCache=function(i){return new TP(i)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new dP(n),this.Gr=new vP(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new _P,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.qr[e.toKey()];return r||(r=new EP(n,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,n,r){H("MemoryPersistence","Starting transaction:",e);const i=new RP(this.Qr.next());return this.referenceDelegate.zr(),r(i).next(s=>this.referenceDelegate.jr(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Hr(e,n){return F.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,n)))}}class RP extends oC{constructor(e){super(),this.currentSequenceNumber=e}}class Rf{constructor(e){this.persistence=e,this.Jr=new Af,this.Yr=null}static Zr(e){return new Rf(e)}get Xr(){if(this.Yr)return this.Yr;throw Y()}addReference(e,n,r){return this.Jr.addReference(r,n),this.Xr.delete(r.toString()),F.resolve()}removeReference(e,n,r){return this.Jr.removeReference(r,n),this.Xr.add(r.toString()),F.resolve()}markPotentiallyOrphaned(e,n){return this.Xr.add(n.toString()),F.resolve()}removeTarget(e,n){this.Jr.gr(n.targetId).forEach(i=>this.Xr.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(i=>{i.forEach(s=>this.Xr.add(s.toString()))}).next(()=>r.removeTargetData(e,n))}zr(){this.Yr=new Set}jr(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return F.forEach(this.Xr,r=>{const i=G.fromPath(r);return this.ei(e,i).next(s=>{s||n.removeEntry(i,X.min())})}).next(()=>(this.Yr=null,n.apply(e)))}updateLimboDocument(e,n){return this.ei(e,n).next(r=>{r?this.Xr.delete(n.toString()):this.Xr.add(n.toString())})}Wr(e){return 0}ei(e,n){return F.or([()=>F.resolve(this.Jr.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Hr(e,n)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kf{constructor(e,n,r,i){this.targetId=e,this.fromCache=n,this.$i=r,this.Ui=i}static Wi(e,n){let r=te(),i=te();for(const s of n.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new kf(e,n.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kP{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CP{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return vS()?8:aC(st())>0?6:4}()}initialize(e,n){this.Ji=e,this.indexManager=n,this.Gi=!0}getDocumentsMatchingQuery(e,n,r,i){const s={result:null};return this.Yi(e,n).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.Zi(e,n,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new kP;return this.Xi(e,n,o).next(l=>{if(s.result=l,this.zi)return this.es(e,n,o,l.size)})}).next(()=>s.result)}es(e,n,r,i){return r.documentReadCount<this.ji?(As()<=re.DEBUG&&H("QueryEngine","SDK will not create cache indexes for query:",ai(n),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),F.resolve()):(As()<=re.DEBUG&&H("QueryEngine","Query:",ai(n),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.Hi*i?(As()<=re.DEBUG&&H("QueryEngine","The SDK decides to create cache indexes for query:",ai(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,sn(n))):F.resolve())}Yi(e,n){if($g(n))return F.resolve(null);let r=sn(n);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(n.limit!==null&&i===1&&(n=Hd(n,null,"F"),r=sn(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const o=te(...s);return this.Ji.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(u=>{const d=this.ts(n,l);return this.ns(n,d,o,u.readTime)?this.Yi(e,Hd(n,null,"F")):this.rs(e,d,n,u)}))})))}Zi(e,n,r,i){return $g(n)||i.isEqual(X.min())?F.resolve(null):this.Ji.getDocuments(e,r).next(s=>{const o=this.ts(n,s);return this.ns(n,o,r,i)?F.resolve(null):(As()<=re.DEBUG&&H("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),ai(n)),this.rs(e,o,n,nC(i,-1)).next(l=>l))})}ts(e,n){let r=new qe(Z0(e));return n.forEach((i,s)=>{fu(e,s)&&(r=r.add(s))}),r}ns(e,n,r,i){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Xi(e,n,r){return As()<=re.DEBUG&&H("QueryEngine","Using full collection scan to execute query:",ai(n)),this.Ji.getDocumentsMatchingQuery(e,n,hr.min(),r)}rs(e,n,r,i){return this.Ji.getDocumentsMatchingQuery(e,r,i).next(s=>(n.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PP{constructor(e,n,r,i){this.persistence=e,this.ss=n,this.serializer=i,this.os=new Te(ae),this._s=new ts(s=>vf(s),_f),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new yP(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.os))}}function xP(t,e,n,r){return new PP(t,e,n,r)}async function ww(t,e){const n=J(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let i;return n.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,n.ls(e),n.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],l=[];let u=te();for(const d of i){o.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}for(const d of s){l.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}return n.localDocuments.getDocuments(r,u).next(d=>({hs:d,removedBatchIds:o,addedBatchIds:l}))})})}function bP(t,e){const n=J(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=n.cs.newChangeBuffer({trackRemovals:!0});return function(l,u,d,f){const m=d.batch,y=m.keys();let R=F.resolve();return y.forEach(C=>{R=R.next(()=>f.getEntry(u,C)).next(b=>{const L=d.docVersions.get(C);de(L!==null),b.version.compareTo(L)<0&&(m.applyToRemoteDocument(b,d),b.isValidDocument()&&(b.setReadTime(d.commitVersion),f.addEntry(b)))})}),R.next(()=>l.mutationQueue.removeMutationBatch(u,m))}(n,r,e,s).next(()=>s.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let u=te();for(let d=0;d<l.mutationResults.length;++d)l.mutationResults[d].transformResults.length>0&&(u=u.add(l.batch.mutations[d].key));return u}(e))).next(()=>n.localDocuments.getDocuments(r,i))})}function Ew(t){const e=J(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ur.getLastRemoteSnapshotVersion(n))}function NP(t,e){const n=J(t),r=e.snapshotVersion;let i=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=n.cs.newChangeBuffer({trackRemovals:!0});i=n.os;const l=[];e.targetChanges.forEach((f,m)=>{const y=i.get(m);if(!y)return;l.push(n.Ur.removeMatchingKeys(s,f.removedDocuments,m).next(()=>n.Ur.addMatchingKeys(s,f.addedDocuments,m)));let R=y.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(m)!==null?R=R.withResumeToken(Ke.EMPTY_BYTE_STRING,X.min()).withLastLimboFreeSnapshotVersion(X.min()):f.resumeToken.approximateByteSize()>0&&(R=R.withResumeToken(f.resumeToken,r)),i=i.insert(m,R),function(b,L,w){return b.resumeToken.approximateByteSize()===0||L.snapshotVersion.toMicroseconds()-b.snapshotVersion.toMicroseconds()>=3e8?!0:w.addedDocuments.size+w.modifiedDocuments.size+w.removedDocuments.size>0}(y,R,f)&&l.push(n.Ur.updateTargetData(s,R))});let u=xn(),d=te();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(DP(s,o,e.documentUpdates).next(f=>{u=f.Ps,d=f.Is})),!r.isEqual(X.min())){const f=n.Ur.getLastRemoteSnapshotVersion(s).next(m=>n.Ur.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(f)}return F.waitFor(l).next(()=>o.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,u,d)).next(()=>u)}).then(s=>(n.os=i,s))}function DP(t,e,n){let r=te(),i=te();return n.forEach(s=>r=r.add(s)),e.getEntries(t,r).next(s=>{let o=xn();return n.forEach((l,u)=>{const d=s.get(l);u.isFoundDocument()!==d.isFoundDocument()&&(i=i.add(l)),u.isNoDocument()&&u.version.isEqual(X.min())?(e.removeEntry(l,u.readTime),o=o.insert(l,u)):!d.isValidDocument()||u.version.compareTo(d.version)>0||u.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(u),o=o.insert(l,u)):H("LocalStore","Ignoring outdated watch update for ",l,". Current version:",d.version," Watch version:",u.version)}),{Ps:o,Is:i}})}function OP(t,e){const n=J(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function VP(t,e){const n=J(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return n.Ur.getTargetData(r,e).next(s=>s?(i=s,F.resolve(i)):n.Ur.allocateTargetId(r).next(o=>(i=new Yn(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.Ur.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=n.os.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(n.os=n.os.insert(r.targetId,r),n._s.set(e,r.targetId)),r})}async function Xd(t,e,n){const r=J(t),i=r.os.get(e),s=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!Lo(o))throw o;H("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}r.os=r.os.remove(e),r._s.delete(i.target)}function ey(t,e,n){const r=J(t);let i=X.min(),s=te();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,d,f){const m=J(u),y=m._s.get(f);return y!==void 0?F.resolve(m.os.get(y)):m.Ur.getTargetData(d,f)}(r,o,sn(e)).next(l=>{if(l)return i=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(o,l.targetId).next(u=>{s=u})}).next(()=>r.ss.getDocumentsMatchingQuery(o,e,n?i:X.min(),n?s:te())).next(l=>(LP(r,AC(e),l),{documents:l,Ts:s})))}function LP(t,e,n){let r=t.us.get(e)||X.min();n.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),t.us.set(e,r)}class ty{constructor(){this.activeTargetIds=bC()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class MP{constructor(){this.so=new ty,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,n,r){this.oo[e]=n}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new ty,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jP{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ny{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){H("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){H("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ba=null;function Dc(){return ba===null?ba=function(){return 268435456+Math.round(2147483648*Math.random())}():ba++,"0x"+ba.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const FP={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UP{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ze="WebChannelConnection";class zP extends class{constructor(n){this.databaseInfo=n,this.databaseId=n.databaseId;const r=n.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+n.host,this.vo=`projects/${i}/databases/${s}`,this.Co=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${s}`}get Fo(){return!1}Mo(n,r,i,s,o){const l=Dc(),u=this.xo(n,r.toUriEncodedString());H("RestConnection",`Sending RPC '${n}' ${l}:`,u,i);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,s,o),this.No(n,u,d,i).then(f=>(H("RestConnection",`Received RPC '${n}' ${l}: `,f),f),f=>{throw Bi("RestConnection",`RPC '${n}' ${l} failed with error: `,f,"url: ",u,"request:",i),f})}Lo(n,r,i,s,o,l){return this.Mo(n,r,i,s,o)}Oo(n,r,i){n["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+es}(),n["Content-Type"]="text/plain",this.databaseInfo.appId&&(n["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((s,o)=>n[o]=s),i&&i.headers.forEach((s,o)=>n[o]=s)}xo(n,r){const i=FP[n];return`${this.Do}/v1/${r}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,n,r,i){const s=Dc();return new Promise((o,l)=>{const u=new V0;u.setWithCredentials(!0),u.listenOnce(L0.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Qa.NO_ERROR:const f=u.getResponseJson();H(Ze,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(f)),o(f);break;case Qa.TIMEOUT:H(Ze,`RPC '${e}' ${s} timed out`),l(new q(M.DEADLINE_EXCEEDED,"Request time out"));break;case Qa.HTTP_ERROR:const m=u.getStatus();if(H(Ze,`RPC '${e}' ${s} failed with status:`,m,"response text:",u.getResponseText()),m>0){let y=u.getResponseJson();Array.isArray(y)&&(y=y[0]);const R=y==null?void 0:y.error;if(R&&R.status&&R.message){const C=function(L){const w=L.toLowerCase().replace(/_/g,"-");return Object.values(M).indexOf(w)>=0?w:M.UNKNOWN}(R.status);l(new q(C,R.message))}else l(new q(M.UNKNOWN,"Server responded with status "+u.getStatus()))}else l(new q(M.UNAVAILABLE,"Connection failed."));break;default:Y()}}finally{H(Ze,`RPC '${e}' ${s} completed.`)}});const d=JSON.stringify(i);H(Ze,`RPC '${e}' ${s} sending request:`,i),u.send(n,"POST",d,r,15)})}Bo(e,n,r){const i=Dc(),s=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=F0(),l=j0(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(u.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,n,r),u.encodeInitMessageHeaders=!0;const f=s.join("");H(Ze,`Creating RPC '${e}' stream ${i}: ${f}`,u);const m=o.createWebChannel(f,u);let y=!1,R=!1;const C=new UP({Io:L=>{R?H(Ze,`Not sending because RPC '${e}' stream ${i} is closed:`,L):(y||(H(Ze,`Opening RPC '${e}' stream ${i} transport.`),m.open(),y=!0),H(Ze,`RPC '${e}' stream ${i} sending:`,L),m.send(L))},To:()=>m.close()}),b=(L,w,E)=>{L.listen(w,S=>{try{E(S)}catch(N){setTimeout(()=>{throw N},0)}})};return b(m,Ns.EventType.OPEN,()=>{R||(H(Ze,`RPC '${e}' stream ${i} transport opened.`),C.yo())}),b(m,Ns.EventType.CLOSE,()=>{R||(R=!0,H(Ze,`RPC '${e}' stream ${i} transport closed`),C.So())}),b(m,Ns.EventType.ERROR,L=>{R||(R=!0,Bi(Ze,`RPC '${e}' stream ${i} transport errored:`,L),C.So(new q(M.UNAVAILABLE,"The operation could not be completed")))}),b(m,Ns.EventType.MESSAGE,L=>{var w;if(!R){const E=L.data[0];de(!!E);const S=E,N=S.error||((w=S[0])===null||w===void 0?void 0:w.error);if(N){H(Ze,`RPC '${e}' stream ${i} received error:`,N);const V=N.status;let j=function(T){const I=Ce[T];if(I!==void 0)return cw(I)}(V),g=N.message;j===void 0&&(j=M.INTERNAL,g="Unknown error status: "+V+" with message "+N.message),R=!0,C.So(new q(j,g)),m.close()}else H(Ze,`RPC '${e}' stream ${i} received:`,E),C.bo(E)}}),b(l,M0.STAT_EVENT,L=>{L.stat===Ud.PROXY?H(Ze,`RPC '${e}' stream ${i} detected buffering proxy`):L.stat===Ud.NOPROXY&&H(Ze,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{C.wo()},0),C}}function Oc(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yu(t){return new XC(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tw{constructor(e,n,r=1e3,i=1.5,s=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=i,this.Qo=s,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),i=Math.max(0,n-r);i>0&&H("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iw{constructor(e,n,r,i,s,o,l,u){this.ui=e,this.Ho=r,this.Jo=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Tw(e,n)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,n){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():n&&n.code===M.RESOURCE_EXHAUSTED?(Pn(n.toString()),Pn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):n&&n.code===M.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(n)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),n=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.Yo===n&&this.P_(r,i)},r=>{e(()=>{const i=new q(M.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(i)})})}P_(e,n){const r=this.h_(this.Yo);this.stream=this.T_(e,n),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(i=>{r(()=>this.I_(i))}),this.stream.onMessage(i=>{r(()=>++this.e_==1?this.E_(i):this.onNext(i))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return H("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return n=>{this.ui.enqueueAndForget(()=>this.Yo===e?n():(H("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class BP extends Iw{constructor(e,n,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}T_(e,n){return this.connection.Bo("Listen",e,n)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const n=eP(this.serializer,e),r=function(s){if(!("targetChange"in s))return X.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?X.min():o.readTime?on(o.readTime):X.min()}(e);return this.listener.d_(n,r)}A_(e){const n={};n.database=Yd(this.serializer),n.addTarget=function(s,o){let l;const u=o.target;if(l=Wd(u)?{documents:rP(s,u)}:{query:iP(s,u)._t},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=fw(s,o.resumeToken);const d=Kd(s,o.expectedCount);d!==null&&(l.expectedCount=d)}else if(o.snapshotVersion.compareTo(X.min())>0){l.readTime=Ml(s,o.snapshotVersion.toTimestamp());const d=Kd(s,o.expectedCount);d!==null&&(l.expectedCount=d)}return l}(this.serializer,e);const r=oP(this.serializer,e);r&&(n.labels=r),this.a_(n)}R_(e){const n={};n.database=Yd(this.serializer),n.removeTarget=e,this.a_(n)}}class $P extends Iw{constructor(e,n,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,n){return this.connection.Bo("Write",e,n)}E_(e){return de(!!e.streamToken),this.lastStreamToken=e.streamToken,de(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){de(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const n=nP(e.writeResults,e.commitTime),r=on(e.commitTime);return this.listener.g_(r,n)}p_(){const e={};e.database=Yd(this.serializer),this.a_(e)}m_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>tP(this.serializer,r))};this.a_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WP extends class{}{constructor(e,n,r,i){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new q(M.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,n,r,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.Mo(e,Gd(n,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new q(M.UNKNOWN,s.toString())})}Lo(e,n,r,i,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.Lo(e,Gd(n,r),i,o,l,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new q(M.UNKNOWN,o.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class qP{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Pn(n),this.D_=!1):H("OnlineStateTracker",n)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HP{constructor(e,n,r,i,s){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=s,this.k_._o(o=>{r.enqueueAndForget(async()=>{Zr(this)&&(H("RemoteStore","Restarting streams for network reachability change."),await async function(u){const d=J(u);d.L_.add(4),await Uo(d),d.q_.set("Unknown"),d.L_.delete(4),await vu(d)}(this))})}),this.q_=new qP(r,i)}}async function vu(t){if(Zr(t))for(const e of t.B_)await e(!0)}async function Uo(t){for(const e of t.B_)await e(!1)}function Sw(t,e){const n=J(t);n.N_.has(e.targetId)||(n.N_.set(e.targetId,e),bf(n)?xf(n):ns(n).r_()&&Pf(n,e))}function Cf(t,e){const n=J(t),r=ns(n);n.N_.delete(e),r.r_()&&Aw(n,e),n.N_.size===0&&(r.r_()?r.o_():Zr(n)&&n.q_.set("Unknown"))}function Pf(t,e){if(t.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(X.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}ns(t).A_(e)}function Aw(t,e){t.Q_.xe(e),ns(t).R_(e)}function xf(t){t.Q_=new KC({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>t.N_.get(e)||null,tt:()=>t.datastore.serializer.databaseId}),ns(t).start(),t.q_.v_()}function bf(t){return Zr(t)&&!ns(t).n_()&&t.N_.size>0}function Zr(t){return J(t).L_.size===0}function Rw(t){t.Q_=void 0}async function KP(t){t.q_.set("Online")}async function GP(t){t.N_.forEach((e,n)=>{Pf(t,e)})}async function QP(t,e){Rw(t),bf(t)?(t.q_.M_(e),xf(t)):t.q_.set("Unknown")}async function YP(t,e,n){if(t.q_.set("Online"),e instanceof hw&&e.state===2&&e.cause)try{await async function(i,s){const o=s.cause;for(const l of s.targetIds)i.N_.has(l)&&(await i.remoteSyncer.rejectListen(l,o),i.N_.delete(l),i.Q_.removeTarget(l))}(t,e)}catch(r){H("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await jl(t,r)}else if(e instanceof Ja?t.Q_.Ke(e):e instanceof dw?t.Q_.He(e):t.Q_.We(e),!n.isEqual(X.min()))try{const r=await Ew(t.localStore);n.compareTo(r)>=0&&await function(s,o){const l=s.Q_.rt(o);return l.targetChanges.forEach((u,d)=>{if(u.resumeToken.approximateByteSize()>0){const f=s.N_.get(d);f&&s.N_.set(d,f.withResumeToken(u.resumeToken,o))}}),l.targetMismatches.forEach((u,d)=>{const f=s.N_.get(u);if(!f)return;s.N_.set(u,f.withResumeToken(Ke.EMPTY_BYTE_STRING,f.snapshotVersion)),Aw(s,u);const m=new Yn(f.target,u,d,f.sequenceNumber);Pf(s,m)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){H("RemoteStore","Failed to raise snapshot:",r),await jl(t,r)}}async function jl(t,e,n){if(!Lo(e))throw e;t.L_.add(1),await Uo(t),t.q_.set("Offline"),n||(n=()=>Ew(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{H("RemoteStore","Retrying IndexedDB access"),await n(),t.L_.delete(1),await vu(t)})}function kw(t,e){return e().catch(n=>jl(t,n,e))}async function _u(t){const e=J(t),n=pr(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;XP(e);)try{const i=await OP(e.localStore,r);if(i===null){e.O_.length===0&&n.o_();break}r=i.batchId,JP(e,i)}catch(i){await jl(e,i)}Cw(e)&&Pw(e)}function XP(t){return Zr(t)&&t.O_.length<10}function JP(t,e){t.O_.push(e);const n=pr(t);n.r_()&&n.V_&&n.m_(e.mutations)}function Cw(t){return Zr(t)&&!pr(t).n_()&&t.O_.length>0}function Pw(t){pr(t).start()}async function ZP(t){pr(t).p_()}async function ex(t){const e=pr(t);for(const n of t.O_)e.m_(n.mutations)}async function tx(t,e,n){const r=t.O_.shift(),i=Tf.from(r,e,n);await kw(t,()=>t.remoteSyncer.applySuccessfulWrite(i)),await _u(t)}async function nx(t,e){e&&pr(t).V_&&await async function(r,i){if(function(o){return WC(o)&&o!==M.ABORTED}(i.code)){const s=r.O_.shift();pr(r).s_(),await kw(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await _u(r)}}(t,e),Cw(t)&&Pw(t)}async function ry(t,e){const n=J(t);n.asyncQueue.verifyOperationInProgress(),H("RemoteStore","RemoteStore received new credentials");const r=Zr(n);n.L_.add(3),await Uo(n),r&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.L_.delete(3),await vu(n)}async function rx(t,e){const n=J(t);e?(n.L_.delete(2),await vu(n)):e||(n.L_.add(2),await Uo(n),n.q_.set("Unknown"))}function ns(t){return t.K_||(t.K_=function(n,r,i){const s=J(n);return s.w_(),new BP(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Eo:KP.bind(null,t),Ro:GP.bind(null,t),mo:QP.bind(null,t),d_:YP.bind(null,t)}),t.B_.push(async e=>{e?(t.K_.s_(),bf(t)?xf(t):t.q_.set("Unknown")):(await t.K_.stop(),Rw(t))})),t.K_}function pr(t){return t.U_||(t.U_=function(n,r,i){const s=J(n);return s.w_(),new $P(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Eo:()=>Promise.resolve(),Ro:ZP.bind(null,t),mo:nx.bind(null,t),f_:ex.bind(null,t),g_:tx.bind(null,t)}),t.B_.push(async e=>{e?(t.U_.s_(),await _u(t)):(await t.U_.stop(),t.O_.length>0&&(H("RemoteStore",`Stopping write stream with ${t.O_.length} pending writes`),t.O_=[]))})),t.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nf{constructor(e,n,r,i,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new lr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,i,s){const o=Date.now()+r,l=new Nf(e,n,o,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new q(M.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Df(t,e){if(Pn("AsyncQueue",`${e}: ${t}`),Lo(t))return new q(M.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ni{constructor(e){this.comparator=e?(n,r)=>e(n,r)||G.comparator(n.key,r.key):(n,r)=>G.comparator(n.key,r.key),this.keyedMap=Ds(),this.sortedSet=new Te(this.comparator)}static emptySet(e){return new Ni(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof Ni)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new Ni;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iy{constructor(){this.W_=new Te(G.comparator)}track(e){const n=e.doc.key,r=this.W_.get(n);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(n,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(n):e.type===1&&r.type===2?this.W_=this.W_.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):Y():this.W_=this.W_.insert(n,e)}G_(){const e=[];return this.W_.inorderTraversal((n,r)=>{e.push(r)}),e}}class Ki{constructor(e,n,r,i,s,o,l,u,d){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=d}static fromInitialDocuments(e,n,r,i,s){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new Ki(e,n,Ni.emptySet(n),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&hu(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let i=0;i<n.length;i++)if(n[i].type!==r[i].type||!n[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ix{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class sx{constructor(){this.queries=sy(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(n,r){const i=J(n),s=i.queries;i.queries=sy(),s.forEach((o,l)=>{for(const u of l.j_)u.onError(r)})})(this,new q(M.ABORTED,"Firestore shutting down"))}}function sy(){return new ts(t=>J0(t),hu)}async function xw(t,e){const n=J(t);let r=3;const i=e.query;let s=n.queries.get(i);s?!s.H_()&&e.J_()&&(r=2):(s=new ix,r=e.J_()?0:1);try{switch(r){case 0:s.z_=await n.onListen(i,!0);break;case 1:s.z_=await n.onListen(i,!1);break;case 2:await n.onFirstRemoteStoreListen(i)}}catch(o){const l=Df(o,`Initialization of query '${ai(e.query)}' failed`);return void e.onError(l)}n.queries.set(i,s),s.j_.push(e),e.Z_(n.onlineState),s.z_&&e.X_(s.z_)&&Of(n)}async function bw(t,e){const n=J(t),r=e.query;let i=3;const s=n.queries.get(r);if(s){const o=s.j_.indexOf(e);o>=0&&(s.j_.splice(o,1),s.j_.length===0?i=e.J_()?0:1:!s.H_()&&e.J_()&&(i=2))}switch(i){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function ox(t,e){const n=J(t);let r=!1;for(const i of e){const s=i.query,o=n.queries.get(s);if(o){for(const l of o.j_)l.X_(i)&&(r=!0);o.z_=i}}r&&Of(n)}function ax(t,e,n){const r=J(t),i=r.queries.get(e);if(i)for(const s of i.j_)s.onError(n);r.queries.delete(e)}function Of(t){t.Y_.forEach(e=>{e.next()})}var Jd,oy;(oy=Jd||(Jd={})).ea="default",oy.Cache="cache";class Nw{constructor(e,n,r){this.query=e,this.ta=n,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new Ki(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.na?this.ia(e)&&(this.ta.next(e),n=!0):this.sa(e,this.onlineState)&&(this.oa(e),n=!0),this.ra=e,n}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let n=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),n=!0),n}sa(e,n){if(!e.fromCache||!this.J_())return!0;const r=n!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const n=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}oa(e){e=Ki.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Jd.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dw{constructor(e){this.key=e}}class Ow{constructor(e){this.key=e}}class lx{constructor(e,n){this.query=e,this.Ta=n,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=te(),this.mutatedKeys=te(),this.Aa=Z0(e),this.Ra=new Ni(this.Aa)}get Va(){return this.Ta}ma(e,n){const r=n?n.fa:new iy,i=n?n.Ra:this.Ra;let s=n?n.mutatedKeys:this.mutatedKeys,o=i,l=!1;const u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,d=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,m)=>{const y=i.get(f),R=fu(this.query,m)?m:null,C=!!y&&this.mutatedKeys.has(y.key),b=!!R&&(R.hasLocalMutations||this.mutatedKeys.has(R.key)&&R.hasCommittedMutations);let L=!1;y&&R?y.data.isEqual(R.data)?C!==b&&(r.track({type:3,doc:R}),L=!0):this.ga(y,R)||(r.track({type:2,doc:R}),L=!0,(u&&this.Aa(R,u)>0||d&&this.Aa(R,d)<0)&&(l=!0)):!y&&R?(r.track({type:0,doc:R}),L=!0):y&&!R&&(r.track({type:1,doc:y}),L=!0,(u||d)&&(l=!0)),L&&(R?(o=o.add(R),s=b?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{Ra:o,fa:r,ns:l,mutatedKeys:s}}ga(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,i){const s=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const o=e.fa.G_();o.sort((f,m)=>function(R,C){const b=L=>{switch(L){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Y()}};return b(R)-b(C)}(f.type,m.type)||this.Aa(f.doc,m.doc)),this.pa(r),i=i!=null&&i;const l=n&&!i?this.ya():[],u=this.da.size===0&&this.current&&!i?1:0,d=u!==this.Ea;return this.Ea=u,o.length!==0||d?{snapshot:new Ki(this.query,e.Ra,s,o,e.mutatedKeys,u===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new iy,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(n=>this.Ta=this.Ta.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ta=this.Ta.delete(n)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=te(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const n=[];return e.forEach(r=>{this.da.has(r)||n.push(new Ow(r))}),this.da.forEach(r=>{e.has(r)||n.push(new Dw(r))}),n}ba(e){this.Ta=e.Ts,this.da=te();const n=this.ma(e.documents);return this.applyChanges(n,!0)}Da(){return Ki.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class ux{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class cx{constructor(e){this.key=e,this.va=!1}}class dx{constructor(e,n,r,i,s,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.Ca={},this.Fa=new ts(l=>J0(l),hu),this.Ma=new Map,this.xa=new Set,this.Oa=new Te(G.comparator),this.Na=new Map,this.La=new Af,this.Ba={},this.ka=new Map,this.qa=Hi.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function hx(t,e,n=!0){const r=Uw(t);let i;const s=r.Fa.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.Da()):i=await Vw(r,e,n,!0),i}async function fx(t,e){const n=Uw(t);await Vw(n,e,!0,!1)}async function Vw(t,e,n,r){const i=await VP(t.localStore,sn(e)),s=i.targetId,o=t.sharedClientState.addLocalQueryTarget(s,n);let l;return r&&(l=await px(t,e,s,o==="current",i.resumeToken)),t.isPrimaryClient&&n&&Sw(t.remoteStore,i),l}async function px(t,e,n,r,i){t.Ka=(m,y,R)=>async function(b,L,w,E){let S=L.view.ma(w);S.ns&&(S=await ey(b.localStore,L.query,!1).then(({documents:g})=>L.view.ma(g,S)));const N=E&&E.targetChanges.get(L.targetId),V=E&&E.targetMismatches.get(L.targetId)!=null,j=L.view.applyChanges(S,b.isPrimaryClient,N,V);return ly(b,L.targetId,j.wa),j.snapshot}(t,m,y,R);const s=await ey(t.localStore,e,!0),o=new lx(e,s.Ts),l=o.ma(s.documents),u=Fo.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",i),d=o.applyChanges(l,t.isPrimaryClient,u);ly(t,n,d.wa);const f=new ux(e,n,o);return t.Fa.set(e,f),t.Ma.has(n)?t.Ma.get(n).push(e):t.Ma.set(n,[e]),d.snapshot}async function mx(t,e,n){const r=J(t),i=r.Fa.get(e),s=r.Ma.get(i.targetId);if(s.length>1)return r.Ma.set(i.targetId,s.filter(o=>!hu(o,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await Xd(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),n&&Cf(r.remoteStore,i.targetId),Zd(r,i.targetId)}).catch(Vo)):(Zd(r,i.targetId),await Xd(r.localStore,i.targetId,!0))}async function gx(t,e){const n=J(t),r=n.Fa.get(e),i=n.Ma.get(r.targetId);n.isPrimaryClient&&i.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Cf(n.remoteStore,r.targetId))}async function yx(t,e,n){const r=Sx(t);try{const i=await function(o,l){const u=J(o),d=Ve.now(),f=l.reduce((R,C)=>R.add(C.key),te());let m,y;return u.persistence.runTransaction("Locally write mutations","readwrite",R=>{let C=xn(),b=te();return u.cs.getEntries(R,f).next(L=>{C=L,C.forEach((w,E)=>{E.isValidDocument()||(b=b.add(w))})}).next(()=>u.localDocuments.getOverlayedDocuments(R,C)).next(L=>{m=L;const w=[];for(const E of l){const S=FC(E,m.get(E.key).overlayedDocument);S!=null&&w.push(new Er(E.key,S,W0(S.value.mapValue),Ot.exists(!0)))}return u.mutationQueue.addMutationBatch(R,d,w,l)}).next(L=>{y=L;const w=L.applyToLocalDocumentSet(m,b);return u.documentOverlayCache.saveOverlays(R,L.batchId,w)})}).then(()=>({batchId:y.batchId,changes:tw(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,l,u){let d=o.Ba[o.currentUser.toKey()];d||(d=new Te(ae)),d=d.insert(l,u),o.Ba[o.currentUser.toKey()]=d}(r,i.batchId,n),await zo(r,i.changes),await _u(r.remoteStore)}catch(i){const s=Df(i,"Failed to persist write");n.reject(s)}}async function Lw(t,e){const n=J(t);try{const r=await NP(n.localStore,e);e.targetChanges.forEach((i,s)=>{const o=n.Na.get(s);o&&(de(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?o.va=!0:i.modifiedDocuments.size>0?de(o.va):i.removedDocuments.size>0&&(de(o.va),o.va=!1))}),await zo(n,r,e)}catch(r){await Vo(r)}}function ay(t,e,n){const r=J(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const i=[];r.Fa.forEach((s,o)=>{const l=o.view.Z_(e);l.snapshot&&i.push(l.snapshot)}),function(o,l){const u=J(o);u.onlineState=l;let d=!1;u.queries.forEach((f,m)=>{for(const y of m.j_)y.Z_(l)&&(d=!0)}),d&&Of(u)}(r.eventManager,e),i.length&&r.Ca.d_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function vx(t,e,n){const r=J(t);r.sharedClientState.updateQueryState(e,"rejected",n);const i=r.Na.get(e),s=i&&i.key;if(s){let o=new Te(G.comparator);o=o.insert(s,nt.newNoDocument(s,X.min()));const l=te().add(s),u=new gu(X.min(),new Map,new Te(ae),o,l);await Lw(r,u),r.Oa=r.Oa.remove(s),r.Na.delete(e),Vf(r)}else await Xd(r.localStore,e,!1).then(()=>Zd(r,e,n)).catch(Vo)}async function _x(t,e){const n=J(t),r=e.batch.batchId;try{const i=await bP(n.localStore,e);jw(n,r,null),Mw(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await zo(n,i)}catch(i){await Vo(i)}}async function wx(t,e,n){const r=J(t);try{const i=await function(o,l){const u=J(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return u.mutationQueue.lookupMutationBatch(d,l).next(m=>(de(m!==null),f=m.keys(),u.mutationQueue.removeMutationBatch(d,m))).next(()=>u.mutationQueue.performConsistencyCheck(d)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(d,f,l)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>u.localDocuments.getDocuments(d,f))})}(r.localStore,e);jw(r,e,n),Mw(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await zo(r,i)}catch(i){await Vo(i)}}function Mw(t,e){(t.ka.get(e)||[]).forEach(n=>{n.resolve()}),t.ka.delete(e)}function jw(t,e,n){const r=J(t);let i=r.Ba[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(n?s.reject(n):s.resolve(),i=i.remove(e)),r.Ba[r.currentUser.toKey()]=i}}function Zd(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Ma.get(e))t.Fa.delete(r),n&&t.Ca.$a(r,n);t.Ma.delete(e),t.isPrimaryClient&&t.La.gr(e).forEach(r=>{t.La.containsKey(r)||Fw(t,r)})}function Fw(t,e){t.xa.delete(e.path.canonicalString());const n=t.Oa.get(e);n!==null&&(Cf(t.remoteStore,n),t.Oa=t.Oa.remove(e),t.Na.delete(n),Vf(t))}function ly(t,e,n){for(const r of n)r instanceof Dw?(t.La.addReference(r.key,e),Ex(t,r)):r instanceof Ow?(H("SyncEngine","Document no longer in limbo: "+r.key),t.La.removeReference(r.key,e),t.La.containsKey(r.key)||Fw(t,r.key)):Y()}function Ex(t,e){const n=e.key,r=n.path.canonicalString();t.Oa.get(n)||t.xa.has(r)||(H("SyncEngine","New document in limbo: "+n),t.xa.add(r),Vf(t))}function Vf(t){for(;t.xa.size>0&&t.Oa.size<t.maxConcurrentLimboResolutions;){const e=t.xa.values().next().value;t.xa.delete(e);const n=new G(ge.fromString(e)),r=t.qa.next();t.Na.set(r,new cx(n)),t.Oa=t.Oa.insert(n,r),Sw(t.remoteStore,new Yn(sn(du(n.path)),r,"TargetPurposeLimboResolution",pf.oe))}}async function zo(t,e,n){const r=J(t),i=[],s=[],o=[];r.Fa.isEmpty()||(r.Fa.forEach((l,u)=>{o.push(r.Ka(u,e,n).then(d=>{var f;if((d||n)&&r.isPrimaryClient){const m=d?!d.fromCache:(f=n==null?void 0:n.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(d){i.push(d);const m=kf.Wi(u.targetId,d);s.push(m)}}))}),await Promise.all(o),r.Ca.d_(i),await async function(u,d){const f=J(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>F.forEach(d,y=>F.forEach(y.$i,R=>f.persistence.referenceDelegate.addReference(m,y.targetId,R)).next(()=>F.forEach(y.Ui,R=>f.persistence.referenceDelegate.removeReference(m,y.targetId,R)))))}catch(m){if(!Lo(m))throw m;H("LocalStore","Failed to update sequence numbers: "+m)}for(const m of d){const y=m.targetId;if(!m.fromCache){const R=f.os.get(y),C=R.snapshotVersion,b=R.withLastLimboFreeSnapshotVersion(C);f.os=f.os.insert(y,b)}}}(r.localStore,s))}async function Tx(t,e){const n=J(t);if(!n.currentUser.isEqual(e)){H("SyncEngine","User change. New user:",e.toKey());const r=await ww(n.localStore,e);n.currentUser=e,function(s,o){s.ka.forEach(l=>{l.forEach(u=>{u.reject(new q(M.CANCELLED,o))})}),s.ka.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await zo(n,r.hs)}}function Ix(t,e){const n=J(t),r=n.Na.get(e);if(r&&r.va)return te().add(r.key);{let i=te();const s=n.Ma.get(e);if(!s)return i;for(const o of s){const l=n.Fa.get(o);i=i.unionWith(l.view.Va)}return i}}function Uw(t){const e=J(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=Lw.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Ix.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=vx.bind(null,e),e.Ca.d_=ox.bind(null,e.eventManager),e.Ca.$a=ax.bind(null,e.eventManager),e}function Sx(t){const e=J(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=_x.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=wx.bind(null,e),e}class Fl{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=yu(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,n){return null}Ha(e,n){return null}za(e){return xP(this.persistence,new CP,e.initialUser,this.serializer)}Ga(e){return new AP(Rf.Zr,this.serializer)}Wa(e){return new MP}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Fl.provider={build:()=>new Fl};class eh{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>ay(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Tx.bind(null,this.syncEngine),await rx(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new sx}()}createDatastore(e){const n=yu(e.databaseInfo.databaseId),r=function(s){return new zP(s)}(e.databaseInfo);return function(s,o,l,u){return new WP(s,o,l,u)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,i,s,o,l){return new HP(r,i,s,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>ay(this.syncEngine,n,0),function(){return ny.D()?new ny:new jP}())}createSyncEngine(e,n){return function(i,s,o,l,u,d,f){const m=new dx(i,s,o,l,u,d);return f&&(m.Qa=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(i){const s=J(i);H("RemoteStore","RemoteStore shutting down."),s.L_.add(5),await Uo(s),s.k_.shutdown(),s.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}eh.provider={build:()=>new eh};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zw{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Pn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ax{constructor(e,n,r,i,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=i,this.user=et.UNAUTHENTICATED,this.clientId=z0.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async o=>{H("FirestoreClient","Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(H("FirestoreClient","Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new lr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=Df(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Vc(t,e){t.asyncQueue.verifyOperationInProgress(),H("FirestoreClient","Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async i=>{r.isEqual(i)||(await ww(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function uy(t,e){t.asyncQueue.verifyOperationInProgress();const n=await Rx(t);H("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>ry(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,i)=>ry(e.remoteStore,i)),t._onlineComponents=e}async function Rx(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){H("FirestoreClient","Using user provided OfflineComponentProvider");try{await Vc(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(i){return i.name==="FirebaseError"?i.code===M.FAILED_PRECONDITION||i.code===M.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(n))throw n;Bi("Error using user provided cache. Falling back to memory cache: "+n),await Vc(t,new Fl)}}else H("FirestoreClient","Using default OfflineComponentProvider"),await Vc(t,new Fl);return t._offlineComponents}async function Bw(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(H("FirestoreClient","Using user provided OnlineComponentProvider"),await uy(t,t._uninitializedComponentsProvider._online)):(H("FirestoreClient","Using default OnlineComponentProvider"),await uy(t,new eh))),t._onlineComponents}function kx(t){return Bw(t).then(e=>e.syncEngine)}async function th(t){const e=await Bw(t),n=e.eventManager;return n.onListen=hx.bind(null,e.syncEngine),n.onUnlisten=mx.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=fx.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=gx.bind(null,e.syncEngine),n}function Cx(t,e,n={}){const r=new lr;return t.asyncQueue.enqueueAndForget(async()=>function(s,o,l,u,d){const f=new zw({next:y=>{f.Za(),o.enqueueAndForget(()=>bw(s,m));const R=y.docs.has(l);!R&&y.fromCache?d.reject(new q(M.UNAVAILABLE,"Failed to get document because the client is offline.")):R&&y.fromCache&&u&&u.source==="server"?d.reject(new q(M.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(y)},error:y=>d.reject(y)}),m=new Nw(du(l.path),f,{includeMetadataChanges:!0,_a:!0});return xw(s,m)}(await th(t),t.asyncQueue,e,n,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $w(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cy=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ww(t,e,n){if(!n)throw new q(M.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function Px(t,e,n,r){if(e===!0&&r===!0)throw new q(M.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function dy(t){if(!G.isDocumentKey(t))throw new q(M.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function hy(t){if(G.isDocumentKey(t))throw new q(M.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function wu(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":Y()}function Vt(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new q(M.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=wu(t);throw new q(M.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fy{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new q(M.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new q(M.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Px("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=$w((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new q(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new q(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new q(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Eu{constructor(e,n,r,i){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new fy({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new q(M.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new q(M.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new fy(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Kk;switch(r.type){case"firstParty":return new Xk(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new q(M.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=cy.get(n);r&&(H("ComponentProvider","Removing Datastore"),cy.delete(n),r.terminate())}(this),Promise.resolve()}}function xx(t,e,n,r={}){var i;const s=(t=Vt(t,Eu))._getSettings(),o=`${e}:${n}`;if(s.host!=="firestore.googleapis.com"&&s.host!==o&&Bi("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},s),{host:o,ssl:!1})),r.mockUserToken){let l,u;if(typeof r.mockUserToken=="string")l=r.mockUserToken,u=et.MOCK_USER;else{l=dS(r.mockUserToken,(i=t._app)===null||i===void 0?void 0:i.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new q(M.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new et(d)}t._authCredentials=new Gk(new U0(l,u))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rs{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new rs(this.firestore,e,this._query)}}class rt{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ur(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new rt(this.firestore,e,this._key)}}class ur extends rs{constructor(e,n,r){super(e,n,du(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new rt(this.firestore,null,new G(e))}withConverter(e){return new ur(this.firestore,e,this._path)}}function ei(t,e,...n){if(t=be(t),Ww("collection","path",e),t instanceof Eu){const r=ge.fromString(e,...n);return hy(r),new ur(t,null,r)}{if(!(t instanceof rt||t instanceof ur))throw new q(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(ge.fromString(e,...n));return hy(r),new ur(t.firestore,null,r)}}function jt(t,e,...n){if(t=be(t),arguments.length===1&&(e=z0.newId()),Ww("doc","path",e),t instanceof Eu){const r=ge.fromString(e,...n);return dy(r),new rt(t,null,new G(r))}{if(!(t instanceof rt||t instanceof ur))throw new q(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(ge.fromString(e,...n));return dy(r),new rt(t.firestore,t instanceof ur?t.converter:null,new G(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class py{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Tw(this,"async_queue_retry"),this.Vu=()=>{const r=Oc();r&&H("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=Oc();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=Oc();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new lr;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Lo(e))throw e;H("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const i=function(o){let l=o.message||"";return o.stack&&(l=o.stack.includes(o.message)?o.stack:o.message+`
`+o.stack),l}(r);throw Pn("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const i=Nf.createAndSchedule(this,e,n,r,s=>this.yu(s));return this.Tu.push(i),i}fu(){this.Eu&&Y()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}function my(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const i=n;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(t,["next","error","complete"])}class mr extends Eu{constructor(e,n,r,i){super(e,n,r,i),this.type="firestore",this._queue=new py,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new py(e),this._firestoreClient=void 0,await e}}}function bx(t,e){const n=typeof t=="object"?t:G_(),r=typeof t=="string"?t:"(default)",i=tf(n,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=uS("firestore");s&&xx(i,...s)}return i}function Lf(t){if(t._terminated)throw new q(M.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||Nx(t),t._firestoreClient}function Nx(t){var e,n,r;const i=t._freezeSettings(),s=function(l,u,d,f){return new cC(l,u,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,$w(f.experimentalLongPollingOptions),f.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,i);t._componentsProvider||!((n=i.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),t._firestoreClient=new Ax(t._authCredentials,t._appCheckCredentials,t._queue,s,t._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Gi(Ke.fromBase64String(e))}catch(n){throw new q(M.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new Gi(Ke.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tu{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new q(M.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new $e(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iu{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new q(M.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new q(M.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return ae(this._lat,e._lat)||ae(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jf{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dx=/^__.*__$/;class Ox{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new Er(e,this.data,this.fieldMask,n,this.fieldTransforms):new jo(e,this.data,n,this.fieldTransforms)}}class qw{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new Er(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function Hw(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Y()}}class Ff{constructor(e,n,r,i,s,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.vu(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Ff(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Fu({path:r,xu:!1});return i.Ou(e),i}Nu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Fu({path:r,xu:!1});return i.vu(),i}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return Ul(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(Hw(this.Cu)&&Dx.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Vx{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||yu(e)}Qu(e,n,r,i=!1){return new Ff({Cu:e,methodName:n,qu:r,path:$e.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Su(t){const e=t._freezeSettings(),n=yu(t._databaseId);return new Vx(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Kw(t,e,n,r,i,s={}){const o=t.Qu(s.merge||s.mergeFields?2:0,e,n,i);zf("Data must be an object, but it was:",o,r);const l=Gw(r,o);let u,d;if(s.merge)u=new Et(o.fieldMask),d=o.fieldTransforms;else if(s.mergeFields){const f=[];for(const m of s.mergeFields){const y=nh(e,m,n);if(!o.contains(y))throw new q(M.INVALID_ARGUMENT,`Field '${y}' is specified in your field mask but missing from your input data.`);Yw(f,y)||f.push(y)}u=new Et(f),d=o.fieldTransforms.filter(m=>u.covers(m.field))}else u=null,d=o.fieldTransforms;return new Ox(new ft(l),u,d)}class Au extends Iu{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Au}}class Uf extends Iu{_toFieldTransform(e){return new VC(e.path,new wo)}isEqual(e){return e instanceof Uf}}function Lx(t,e,n,r){const i=t.Qu(1,e,n);zf("Data must be an object, but it was:",i,r);const s=[],o=ft.empty();Jr(r,(u,d)=>{const f=Bf(e,u,n);d=be(d);const m=i.Nu(f);if(d instanceof Au)s.push(f);else{const y=Bo(d,m);y!=null&&(s.push(f),o.set(f,y))}});const l=new Et(s);return new qw(o,l,i.fieldTransforms)}function Mx(t,e,n,r,i,s){const o=t.Qu(1,e,n),l=[nh(e,r,n)],u=[i];if(s.length%2!=0)throw new q(M.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let y=0;y<s.length;y+=2)l.push(nh(e,s[y])),u.push(s[y+1]);const d=[],f=ft.empty();for(let y=l.length-1;y>=0;--y)if(!Yw(d,l[y])){const R=l[y];let C=u[y];C=be(C);const b=o.Nu(R);if(C instanceof Au)d.push(R);else{const L=Bo(C,b);L!=null&&(d.push(R),f.set(R,L))}}const m=new Et(d);return new qw(f,m,o.fieldTransforms)}function jx(t,e,n,r=!1){return Bo(n,t.Qu(r?4:3,e))}function Bo(t,e){if(Qw(t=be(t)))return zf("Unsupported field value:",e,t),Gw(t,e);if(t instanceof Iu)return function(r,i){if(!Hw(i.Cu))throw i.Bu(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,i){const s=[];let o=0;for(const l of r){let u=Bo(l,i.Lu(o));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),o++}return{arrayValue:{values:s}}}(t,e)}return function(r,i){if((r=be(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return NC(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=Ve.fromDate(r);return{timestampValue:Ml(i.serializer,s)}}if(r instanceof Ve){const s=new Ve(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Ml(i.serializer,s)}}if(r instanceof Mf)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Gi)return{bytesValue:fw(i.serializer,r._byteString)};if(r instanceof rt){const s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.Bu(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Sf(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof jf)return function(o,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:o.toArray().map(u=>{if(typeof u!="number")throw l.Bu("VectorValues must only contain numeric values.");return wf(l.serializer,u)})}}}}}}(r,i);throw i.Bu(`Unsupported field value: ${wu(r)}`)}(t,e)}function Gw(t,e){const n={};return B0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Jr(t,(r,i)=>{const s=Bo(i,e.Mu(r));s!=null&&(n[r]=s)}),{mapValue:{fields:n}}}function Qw(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof Ve||t instanceof Mf||t instanceof Gi||t instanceof rt||t instanceof Iu||t instanceof jf)}function zf(t,e,n){if(!Qw(n)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(n)){const r=wu(n);throw r==="an object"?e.Bu(t+" a custom object"):e.Bu(t+" "+r)}}function nh(t,e,n){if((e=be(e))instanceof Tu)return e._internalPath;if(typeof e=="string")return Bf(t,e);throw Ul("Field path arguments must be of type string or ",t,!1,void 0,n)}const Fx=new RegExp("[~\\*/\\[\\]]");function Bf(t,e,n){if(e.search(Fx)>=0)throw Ul(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Tu(...e.split("."))._internalPath}catch{throw Ul(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Ul(t,e,n,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new q(M.INVALID_ARGUMENT,l+t+u)}function Yw(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xw{constructor(e,n,r,i,s){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new rt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Ux(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field($f("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class Ux extends Xw{data(){return super.data()}}function $f(t,e){return typeof e=="string"?Bf(t,e):e instanceof Tu?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zx(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new q(M.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Wf{}class Bx extends Wf{}function Jw(t,e,...n){let r=[];e instanceof Wf&&r.push(e),r=r.concat(n),function(s){const o=s.filter(u=>u instanceof qf).length,l=s.filter(u=>u instanceof Ru).length;if(o>1||o>0&&l>0)throw new q(M.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)t=i._apply(t);return t}class Ru extends Bx{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new Ru(e,n,r)}_apply(e){const n=this._parse(e);return eE(e._query,n),new rs(e.firestore,e.converter,qd(e._query,n))}_parse(e){const n=Su(e.firestore);return function(s,o,l,u,d,f,m){let y;if(d.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new q(M.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){yy(m,f);const R=[];for(const C of m)R.push(gy(u,s,C));y={arrayValue:{values:R}}}else y=gy(u,s,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||yy(m,f),y=jx(l,o,m,f==="in"||f==="not-in");return xe.create(d,f,y)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function Zw(t,e,n){const r=e,i=$f("where",t);return Ru._create(i,r,n)}class qf extends Wf{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new qf(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:Gt.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(i,s){let o=i;const l=s.getFlattenedFilters();for(const u of l)eE(o,u),o=qd(o,u)}(e._query,n),new rs(e.firestore,e.converter,qd(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function gy(t,e,n){if(typeof(n=be(n))=="string"){if(n==="")throw new q(M.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!X0(e)&&n.indexOf("/")!==-1)throw new q(M.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(ge.fromString(n));if(!G.isDocumentKey(r))throw new q(M.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Mg(t,new G(r))}if(n instanceof rt)return Mg(t,n._key);throw new q(M.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${wu(n)}.`)}function yy(t,e){if(!Array.isArray(t)||t.length===0)throw new q(M.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function eE(t,e){const n=function(i,s){for(const o of i)for(const l of o.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new q(M.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new q(M.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class $x{convertValue(e,n="none"){switch(Kr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Ae(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Hr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw Y()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Jr(e,(i,s)=>{r[i]=this.convertValue(s,n)}),r}convertVectorValue(e){var n,r,i;const s=(i=(r=(n=e.fields)===null||n===void 0?void 0:n.value.arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(o=>Ae(o.doubleValue));return new jf(s)}convertGeoPoint(e){return new Mf(Ae(e.latitude),Ae(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=gf(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(yo(e));default:return null}}convertTimestamp(e){const n=fr(e);return new Ve(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=ge.fromString(e);de(_w(r));const i=new vo(r.get(1),r.get(3)),s=new G(r.popFirst(5));return i.isEqual(n)||Pn(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tE(t,e,n){let r;return r=t?t.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class nE extends Xw{constructor(e,n,r,i,s,o){super(e,n,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new Za(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field($f("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class Za extends nE{data(e={}){return super.data(e)}}class Wx{constructor(e,n,r,i){this._firestore=e,this._userDataWriter=n,this._snapshot=i,this.metadata=new Vs(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new Za(this._firestore,this._userDataWriter,r.key,r,new Vs(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new q(M.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(l=>{const u=new Za(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Vs(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{const u=new Za(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Vs(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);let d=-1,f=-1;return l.type!==0&&(d=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),f=o.indexOf(l.doc.key)),{type:qx(l.type),doc:u,oldIndex:d,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function qx(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Y()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hf(t){t=Vt(t,rt);const e=Vt(t.firestore,mr);return Cx(Lf(e),t._key).then(n=>sE(e,t,n))}class rE extends $x{constructor(e){super(),this.firestore=e}convertBytes(e){return new Gi(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new rt(this.firestore,null,n)}}function rh(t,e,n){t=Vt(t,rt);const r=Vt(t.firestore,mr),i=tE(t.converter,e);return ku(r,[Kw(Su(r),"setDoc",t._key,i,t.converter!==null,n).toMutation(t._key,Ot.none())])}function zl(t,e,n,...r){t=Vt(t,rt);const i=Vt(t.firestore,mr),s=Su(i);let o;return o=typeof(e=be(e))=="string"||e instanceof Tu?Mx(s,"updateDoc",t._key,e,n,r):Lx(s,"updateDoc",t._key,e),ku(i,[o.toMutation(t._key,Ot.exists(!0))])}function Hx(t){return ku(Vt(t.firestore,mr),[new Ef(t._key,Ot.none())])}function iE(t,e){const n=Vt(t.firestore,mr),r=jt(t),i=tE(t.converter,e);return ku(n,[Kw(Su(t.firestore),"addDoc",r._key,i,t.converter!==null,{}).toMutation(r._key,Ot.exists(!1))]).then(()=>r)}function $o(t,...e){var n,r,i;t=be(t);let s={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||my(e[o])||(s=e[o],o++);const l={includeMetadataChanges:s.includeMetadataChanges,source:s.source};if(my(e[o])){const m=e[o];e[o]=(n=m.next)===null||n===void 0?void 0:n.bind(m),e[o+1]=(r=m.error)===null||r===void 0?void 0:r.bind(m),e[o+2]=(i=m.complete)===null||i===void 0?void 0:i.bind(m)}let u,d,f;if(t instanceof rt)d=Vt(t.firestore,mr),f=du(t._key.path),u={next:m=>{e[o]&&e[o](sE(d,t,m))},error:e[o+1],complete:e[o+2]};else{const m=Vt(t,rs);d=Vt(m.firestore,mr),f=m._query;const y=new rE(d);u={next:R=>{e[o]&&e[o](new Wx(d,y,m,R))},error:e[o+1],complete:e[o+2]},zx(t._query)}return function(y,R,C,b){const L=new zw(b),w=new Nw(R,L,C);return y.asyncQueue.enqueueAndForget(async()=>xw(await th(y),w)),()=>{L.Za(),y.asyncQueue.enqueueAndForget(async()=>bw(await th(y),w))}}(Lf(d),f,l,u)}function ku(t,e){return function(r,i){const s=new lr;return r.asyncQueue.enqueueAndForget(async()=>yx(await kx(r),i,s)),s.promise}(Lf(t),e)}function sE(t,e,n){const r=n.docs.get(e._key),i=new rE(t);return new nE(t,i,e._key,r,new Vs(n.hasPendingWrites,n.fromCache),e.converter)}function Cu(){return new Uf("serverTimestamp")}(function(e,n=!0){(function(i){es=i})(Ji),Ui(new Br("firestore",(r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),l=new mr(new Qk(r.getProvider("auth-internal")),new Zk(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new q(M.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new vo(d.options.projectId,f)}(o,i),o);return s=Object.assign({useFetchStreams:n},s),l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),ar(Ng,"4.7.3",e),ar(Ng,"4.7.3","esm2017")})();var Kx="firebase",Gx="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ar(Kx,Gx,"app");const Qx={apiKey:"AIzaSyB2Q-qfQADa6FWrXnv5wFQrU4i9fdt3BQU",authDomain:"feedozone.firebaseapp.com",projectId:"feedozone",storageBucket:"feedozone.firebasestorage.app",messagingSenderId:"203132079474",appId:"1:203132079474:web:97886d0ca3fce961fea1eb"},oE=nf(Qx),Wo=D0(oE),Fe=bx(oE),aE=B.createContext(null),Yx=({children:t})=>{const[e,n]=B.useState(null),[r,i]=B.useState(null),[s,o]=B.useState(!0);return B.useEffect(()=>VR(Wo,async u=>{if(u){n(u);try{const d=await Hf(jt(Fe,"users",u.uid));d.exists()?i(d.data()):(console.warn("No Firestore profile found for UID:",u.uid),i(null))}catch(d){console.error("Firestore fetch error:",d),i(null)}}else n(null),i(null);o(!1)}),[]),p.jsx(aE.Provider,{value:{user:e,userData:r,loading:s},children:t})},Pu=()=>B.useContext(aE),lE=(t,e)=>xR(Wo,t,e),Gr=()=>T0(Wo),Xx=async(t,e)=>{const{email:n,password:r,storeName:i,address:s,phone:o,plan:l,category:u}=e,f=Wo.app.options,m=nf(f,"secondary-"+Date.now()),y=D0(m),R=await E0(y,n,r),C=R.user.uid;await NR(R.user,{displayName:i}),await T0(y);const b={uid:C,role:"vendor",email:n,storeName:i,address:s||"",phone:o||"",plan:l||"₹500/month",category:u||"Thali",isOpen:!1,prepTime:20,subscriptionStatus:"active",rating:4.5,totalOrders:0,createdBy:t,createdAt:Cu()};return await rh(jt(Fe,"users",C),b),await rh(jt(Fe,"vendors",C),b),C},uE=t=>$o(ei(Fe,"vendors"),e=>t(e.docs.map(n=>({id:n.id,...n.data()}))),e=>{console.error("Vendors error:",e.code),t([])}),Jx=async(t,e)=>{await zl(jt(Fe,"vendors",t),e);try{await zl(jt(Fe,"users",t),e)}catch{}},cE=(t,e)=>$o(ei(Fe,"vendors",t,"menu"),n=>e(n.docs.map(r=>({id:r.id,...r.data()}))),n=>{console.error("Menu error:",n.code),e([])}),Zx=(t,e)=>iE(ei(Fe,"vendors",t,"menu"),{...e,available:!0,createdAt:Cu()}),e2=(t,e,n)=>zl(jt(Fe,"vendors",t,"menu",e),n),t2=(t,e)=>Hx(jt(Fe,"vendors",t,"menu",e)),n2=t=>iE(ei(Fe,"orders"),{...t,status:"pending",createdAt:Cu()}),r2=(t,e)=>$o(Jw(ei(Fe,"orders"),Zw("vendorUid","==",t)),n=>{const r=n.docs.map(i=>({id:i.id,...i.data()}));r.sort((i,s)=>{var o,l;return(((o=s.createdAt)==null?void 0:o.seconds)||0)-(((l=i.createdAt)==null?void 0:l.seconds)||0)}),e(r)},n=>{console.error("Vendor orders error:",n.code),e([])}),i2=(t,e)=>$o(Jw(ei(Fe,"orders"),Zw("userUid","==",t)),n=>{const r=n.docs.map(i=>({id:i.id,...i.data()}));r.sort((i,s)=>{var o,l;return(((o=s.createdAt)==null?void 0:o.seconds)||0)-(((l=i.createdAt)==null?void 0:l.seconds)||0)}),e(r)},n=>{console.error("User orders error:",n.code),e([])}),s2=t=>$o(ei(Fe,"orders"),e=>{const n=e.docs.map(r=>({id:r.id,...r.data()}));n.sort((r,i)=>{var s,o;return(((s=i.createdAt)==null?void 0:s.seconds)||0)-(((o=r.createdAt)==null?void 0:o.seconds)||0)}),t(n)},e=>{console.error("All orders error:",e.code),t([])}),vy=(t,e)=>zl(jt(Fe,"orders",t),{status:e,updatedAt:Cu()});function _y(){const[t,e]=B.useState("user"),[n,r]=B.useState("login"),[i,s]=B.useState(""),[o,l]=B.useState(""),[u,d]=B.useState(""),[f,m]=B.useState(""),[y,R]=B.useState(!1),C=()=>{s(""),l(""),d(""),m("")},b=async V=>{if(V.preventDefault(),!u.trim())return ne.error("Enter your full name");if(!f.trim()||f.length<10)return ne.error("Enter a valid 10-digit mobile number");if(!i.trim())return ne.error("Enter email address");if(o.length<6)return ne.error("Password must be at least 6 characters");R(!0);try{const g=(await E0(Wo,i,o)).user.uid;await rh(jt(Fe,"users",g),{uid:g,name:u.trim(),email:i.trim().toLowerCase(),mobile:f.trim(),role:"user",createdAt:new Date().toISOString()}),ne.success(`Welcome to FeedoZone, ${u.trim().split(" ")[0]}! 🎉`),setTimeout(()=>{window.location.href="/home"},600)}catch(j){const g=j.code==="auth/email-already-in-use"?"This email is already registered. Try logging in.":j.code==="auth/invalid-email"?"Invalid email format":j.code==="auth/weak-password"?"Password is too weak":"Sign up failed. Try again.";ne.error(g),R(!1)}},L=async V=>{if(V.preventDefault(),!i||!o)return ne.error("Enter email and password");R(!0);try{const g=(await lE(i,o)).user.uid,_=await Hf(jt(Fe,"users",g));if(!_.exists()){await Gr(),ne.error("Account not found. Ask FeedoZone founder to create your account."),R(!1);return}const T=_.data(),I=T.role;if(I!==t){await Gr(),ne.error(t==="vendor"?"You are not a Vendor. Try User login.":`You are not a User. You have ${I} access.`),R(!1);return}ne.success(`Welcome back, ${T.name||T.storeName||""}!`),setTimeout(()=>{I==="vendor"?window.location.href="/vendor":window.location.href="/home"},500)}catch(j){const g=j.code==="auth/invalid-credential"?"Wrong email or password":j.code==="auth/user-not-found"?"No account found":j.code==="auth/invalid-email"?"Invalid email format":j.code==="auth/too-many-requests"?"Too many attempts. Try again later.":"Login failed. Try again.";ne.error(g),R(!1)}},w={user:{hint:"Order food from local restaurants",color:"#2563eb",bg:"#eff6ff",border:"#bfdbfe"},vendor:{hint:"Login with credentials given by FeedoZone founder",color:"#7c3aed",bg:"#f5f3ff",border:"#ddd6fe"}},E=w[t],S={width:"100%",padding:"13px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,fontFamily:"Poppins, sans-serif",outline:"none",color:"#1f2937",boxSizing:"border-box"},N=t==="user"&&n==="signup";return p.jsxs("div",{style:{maxWidth:430,margin:"0 auto",background:"#fff",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",fontFamily:"Poppins, sans-serif"},children:[p.jsxs("div",{style:{textAlign:"center",marginBottom:28},children:[p.jsx("div",{style:{fontSize:36,fontWeight:700,color:"#E24B4A",letterSpacing:-1},children:"Feedo"}),p.jsx("div",{style:{fontSize:13,color:"#6b7280",marginTop:4},children:"Warananagar, Kolhapur"})]}),p.jsx("div",{style:{display:"flex",gap:8,marginBottom:16,width:"100%"},children:["user","vendor"].map(V=>p.jsx("button",{onClick:()=>{e(V),r("login"),C()},style:{flex:1,padding:"10px 4px",border:`2px solid ${t===V?"#E24B4A":"#e5e7eb"}`,borderRadius:10,background:t===V?"#FCEBEB":"#fafafa",color:t===V?"#A32D2D":"#6b7280",fontWeight:t===V?600:400,fontSize:14,cursor:"pointer",fontFamily:"Poppins, sans-serif",textTransform:"capitalize",transition:"all 0.15s"},children:V==="user"?"👤 User":"🏪 Vendor"},V))}),p.jsx("div",{style:{width:"100%",padding:"10px 14px",background:E.bg,border:`1px solid ${E.border}`,borderRadius:10,fontSize:12,color:E.color,marginBottom:20,textAlign:"center"},children:w[t].hint}),t==="user"&&p.jsx("div",{style:{display:"flex",width:"100%",background:"#f3f4f6",borderRadius:10,padding:4,marginBottom:20,gap:4},children:["login","signup"].map(V=>p.jsx("button",{onClick:()=>{r(V),C()},style:{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"Poppins, sans-serif",fontSize:13,fontWeight:n===V?600:400,background:n===V?"#fff":"transparent",color:n===V?"#E24B4A":"#6b7280",boxShadow:n===V?"0 1px 4px rgba(0,0,0,0.08)":"none",transition:"all 0.15s"},children:V==="login"?"🔑 Login":"✨ Sign Up"},V))}),N?p.jsxs("form",{onSubmit:b,style:{width:"100%",display:"flex",flexDirection:"column",gap:12},children:[p.jsx("input",{type:"text",placeholder:"Full name",value:u,onChange:V=>d(V.target.value),style:S}),p.jsxs("div",{style:{position:"relative"},children:[p.jsx("span",{style:{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#6b7280",fontFamily:"Poppins, sans-serif",pointerEvents:"none"},children:"+91"}),p.jsx("input",{type:"tel",placeholder:"Mobile number",value:f,onChange:V=>m(V.target.value.replace(/\D/g,"").slice(0,10)),style:{...S,paddingLeft:48}})]}),p.jsx("input",{type:"email",placeholder:"Email address",value:i,onChange:V=>s(V.target.value),style:S}),p.jsx("input",{type:"password",placeholder:"Create password (min 6 chars)",value:o,onChange:V=>l(V.target.value),style:S}),p.jsx("button",{type:"submit",disabled:y,style:{width:"100%",background:y?"#f09595":"#E24B4A",color:"#fff",border:"none",padding:14,borderRadius:10,fontSize:15,fontWeight:600,cursor:y?"not-allowed":"pointer",fontFamily:"Poppins, sans-serif",marginTop:4,transition:"background 0.15s"},children:y?"Creating Account...":"Create Account 🚀"}),p.jsxs("p",{style:{textAlign:"center",fontSize:12,color:"#6b7280",margin:"4px 0 0"},children:["Already have an account?"," ",p.jsx("span",{onClick:()=>{r("login"),C()},style:{color:"#E24B4A",cursor:"pointer",fontWeight:600},children:"Login here"})]})]}):p.jsxs("form",{onSubmit:L,style:{width:"100%",display:"flex",flexDirection:"column",gap:12},children:[p.jsx("input",{type:"email",placeholder:t==="founder"?"Founder email":t==="vendor"?"Vendor email (given by founder)":"Your email address",value:i,onChange:V=>s(V.target.value),style:S}),p.jsx("input",{type:"password",placeholder:"Password",value:o,onChange:V=>l(V.target.value),style:S}),p.jsx("button",{type:"submit",disabled:y,style:{width:"100%",background:y?"#f09595":"#E24B4A",color:"#fff",border:"none",padding:14,borderRadius:10,fontSize:15,fontWeight:600,cursor:y?"not-allowed":"pointer",fontFamily:"Poppins, sans-serif",marginTop:4,transition:"background 0.15s"},children:y?"Verifying...":`Login as ${t.charAt(0).toUpperCase()+t.slice(1)}`}),t==="user"&&p.jsxs("p",{style:{textAlign:"center",fontSize:12,color:"#6b7280",margin:"4px 0 0"},children:["New to FeedoZone?"," ",p.jsx("span",{onClick:()=>{r("signup"),C()},style:{color:"#E24B4A",cursor:"pointer",fontWeight:600},children:"Create account"})]})]}),t==="vendor"&&p.jsxs("div",{style:{width:"100%",marginTop:20},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16},children:[p.jsx("div",{style:{flex:1,height:1,background:"#e5e7eb"}}),p.jsx("span",{style:{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"},children:"New vendor?"}),p.jsx("div",{style:{flex:1,height:1,background:"#e5e7eb"}})]}),p.jsx("button",{onClick:()=>window.open("https://forms.gle/1arTekd59tidriKcA","_blank"),style:{width:"100%",padding:"13px 14px",background:"linear-gradient(135deg, #7c3aed, #6d28d9)",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Poppins, sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 2px 8px rgba(124,58,237,0.25)",transition:"opacity 0.15s"},onMouseEnter:V=>V.currentTarget.style.opacity="0.9",onMouseLeave:V=>V.currentTarget.style.opacity="1",children:"🤝 Become a Partner"}),p.jsx("p",{style:{textAlign:"center",fontSize:11,color:"#9ca3af",marginTop:8},children:"Submit your details — our team will set up your vendor account"})]}),p.jsx("div",{style:{marginTop:32,fontSize:11,color:"#9ca3af",textAlign:"center"},children:"FeedoZone © 2025 · feedozone2030@gmail.com"})]})}const oi={shell:{maxWidth:430,margin:"0 auto",background:"#fff",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"Poppins,sans-serif"},redHdr:{background:"#E24B4A",color:"#fff",padding:"16px",flexShrink:0},pageContent:{flex:1,overflowY:"auto"},bottomNav:{display:"flex",borderTop:"1px solid #e5e7eb",background:"#fff",flexShrink:0},bnItem:t=>({flex:1,padding:"10px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",border:"none",background:"transparent",fontFamily:"Poppins,sans-serif"}),card:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden",marginBottom:12,cursor:"pointer"},badge:t=>({background:t==="green"?"#d1fae5":t==="red"?"#fee2e2":"#fef3c7",color:t==="green"?"#065f46":t==="red"?"#991b1b":"#92400e",fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:10})},o2=["All","Thali","Biryani","Chinese","Snacks","Juice","Sweets"];function a2(){const{user:t,userData:e}=Pu(),[n,r]=B.useState("home"),[i,s]=B.useState([]),[o,l]=B.useState(null),[u,d]=B.useState([]),[f,m]=B.useState([]),[y,R]=B.useState(null),[C,b]=B.useState([]),[L,w]=B.useState("All"),[E,S]=B.useState("en"),[N,V]=B.useState(""),[j,g]=B.useState(""),[_,T]=B.useState(!1),I=(D,K)=>E==="mr"?K:D;B.useEffect(()=>uE(s),[]),B.useEffect(()=>{if(t)return i2(t.uid,b)},[t]),B.useEffect(()=>{if(o)return cE(o.id,d)},[o]);const k=D=>{l(D),r("vendor-menu")},P=D=>{if(y&&y.id!==o.id){ne.error("Clear cart first — you already have items from "+y.storeName);return}R(o),m(K=>K.find(Z=>Z.id===D.id)?K.map(Z=>Z.id===D.id?{...Z,qty:Z.qty+1}:Z):[...K,{...D,qty:1}]),ne.success(D.name+" added!")},A=(D,K)=>{m(le=>{const Z=le.map(ue=>ue.id===D?{...ue,qty:ue.qty+K}:ue).filter(ue=>ue.qty>0);return Z.length===0&&R(null),Z})},ke=f.reduce((D,K)=>D+K.price*K.qty,0),Rt=f.reduce((D,K)=>D+K.qty,0),Tr=async()=>{if(!N&&!j)return ne.error("Enter delivery address or hostel");try{await n2({userUid:t.uid,userName:(e==null?void 0:e.name)||t.email.split("@")[0],userPhone:(e==null?void 0:e.phone)||"",userEmail:t.email,vendorUid:y.id,vendorName:y.storeName,items:f.map(D=>({id:D.id,name:D.name,price:D.price,qty:D.qty})),subtotal:ke,deliveryFee:30,total:ke+30,address:j?`${j} — ${N}`:N,paymentMode:"COD"}),ne.success("🎉 Order placed successfully!"),m([]),R(null),T(!1),V(""),g(""),r("orders")}catch{ne.error("Failed to place order. Try again.")}},kt=i.filter(D=>L==="All"||D.category===L),$={width:"100%",padding:"11px 13px",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,fontFamily:"Poppins,sans-serif",outline:"none",marginTop:6};return p.jsxs("div",{style:oi.shell,children:[p.jsxs("div",{style:oi.redHdr,children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:[p.jsxs("div",{children:[p.jsx("div",{style:{fontSize:24,fontWeight:700,letterSpacing:-.5},children:I("Feedo","फिडो")}),p.jsx("div",{style:{fontSize:12,opacity:.85,marginTop:2},children:"Warananagar, Kolhapur"})]}),p.jsx("button",{onClick:()=>S(D=>D==="en"?"mr":"en"),style:{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",padding:"5px 10px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"Poppins"},children:E==="en"?"मराठी":"English"})]}),(n==="home"||n==="vendor-menu")&&p.jsxs("div",{style:{background:"#fff",borderRadius:10,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",marginTop:12},children:[p.jsx("span",{style:{fontSize:16},children:"🔍"}),p.jsx("input",{style:{border:"none",outline:"none",fontSize:14,flex:1,fontFamily:"Poppins"},placeholder:I("Search restaurants or food...","रेस्टॉरंट शोधा...")})]}),n==="vendor-menu"&&o&&p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:10},children:[p.jsx("button",{onClick:()=>r("home"),style:{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",padding:"5px 10px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"Poppins"},children:"← Back"}),p.jsx("span",{style:{fontSize:14,fontWeight:600},children:o.storeName}),p.jsx("span",{style:{fontSize:11,background:o.isOpen?"#16a34a":"#dc2626",color:"#fff",padding:"2px 8px",borderRadius:10},children:o.isOpen?"Open":"Closed"})]})]}),p.jsxs("div",{style:oi.pageContent,children:[n==="home"&&p.jsxs("div",{children:[p.jsx("div",{style:{display:"flex",gap:8,padding:"12px 16px 4px",overflowX:"auto"},children:o2.map(D=>p.jsx("div",{onClick:()=>w(D),style:{flexShrink:0,background:L===D?"#E24B4A":"#FCEBEB",color:L===D?"#fff":"#A32D2D",border:"1px solid #F7C1C1",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:500,cursor:"pointer"},children:D},D))}),p.jsx("div",{style:{padding:"12px 16px 4px",fontSize:15,fontWeight:600},children:I("Vendors Near You","तुमच्या जवळचे विक्रेते")}),kt.length===0&&p.jsx("div",{style:{textAlign:"center",padding:40,color:"#9ca3af",fontSize:13},children:"No vendors available yet"}),p.jsx("div",{style:{padding:"0 16px"},children:kt.map(D=>p.jsxs("div",{style:oi.card,onClick:()=>k(D),children:[p.jsxs("div",{style:{height:80,background:"linear-gradient(135deg,#fee2e2,#fecaca)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"},children:[p.jsx("span",{style:{fontSize:36},children:"🍽️"}),p.jsx("span",{style:{position:"absolute",top:8,left:8,background:"#E24B4A",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:600},children:D.category||"Food"}),p.jsx("span",{style:{position:"absolute",top:8,right:8,background:D.isOpen?"#16a34a":"#dc2626",color:"#fff",fontSize:9,padding:"2px 6px",borderRadius:10},children:D.isOpen?"Open":"Closed"})]}),p.jsxs("div",{style:{padding:"10px 12px"},children:[p.jsx("div",{style:{fontSize:14,fontWeight:600,color:"#1f2937"},children:D.storeName}),p.jsxs("div",{style:{display:"flex",gap:10,marginTop:4},children:[p.jsxs("span",{style:{fontSize:11,color:"#f59e0b"},children:["⭐ ",D.rating||4.5]}),p.jsxs("span",{style:{fontSize:11,color:"#6b7280"},children:[D.prepTime||20,"-",(D.prepTime||20)+15," min"]}),p.jsx("span",{style:{fontSize:11,color:"#6b7280"},children:"₹30 delivery"})]}),D.address&&p.jsxs("div",{style:{fontSize:11,color:"#9ca3af",marginTop:3},children:["📍 ",D.address]})]})]},D.id))}),p.jsx("div",{style:{height:80}})]}),n==="vendor-menu"&&o&&p.jsxs("div",{style:{padding:"0 16px 80px"},children:[p.jsxs("div",{style:{padding:"12px 0 4px",fontSize:13,color:"#6b7280"},children:[o.address," · Prep ",o.prepTime||20," min"]}),!o.isOpen&&p.jsx("div",{style:{background:"#fee2e2",color:"#991b1b",padding:"10px 14px",borderRadius:10,fontSize:13,margin:"8px 0"},children:"⚠️ This store is currently closed. You can still browse the menu."}),u.length===0&&p.jsx("div",{style:{textAlign:"center",padding:40,color:"#9ca3af",fontSize:13},children:"No menu items added yet"}),u.filter(D=>D.available).map(D=>p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #f3f4f6"},children:[p.jsxs("div",{style:{flex:1},children:[p.jsx("div",{style:{fontSize:13,fontWeight:600,color:"#1f2937"},children:D.name}),p.jsx("div",{style:{fontSize:12,color:"#6b7280",marginTop:2},children:D.category}),p.jsxs("div",{style:{fontSize:14,fontWeight:600,color:"#E24B4A",marginTop:2},children:["₹",D.price]})]}),(()=>{const K=f.find(le=>le.id===D.id);return K?p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[p.jsx("button",{onClick:()=>A(D.id,-1),style:{width:28,height:28,borderRadius:"50%",border:"1px solid #E24B4A",background:"transparent",color:"#E24B4A",cursor:"pointer",fontSize:16,fontWeight:600},children:"-"}),p.jsx("span",{style:{fontSize:13,fontWeight:600,minWidth:16,textAlign:"center"},children:K.qty}),p.jsx("button",{onClick:()=>P(D),style:{width:28,height:28,borderRadius:"50%",border:"none",background:"#E24B4A",color:"#fff",cursor:"pointer",fontSize:16,fontWeight:600},children:"+"})]}):p.jsx("button",{onClick:()=>P(D),style:{background:"#E24B4A",color:"#fff",border:"none",padding:"7px 16px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Poppins"},children:"ADD"})})()]},D.id))]}),n==="cart"&&p.jsxs("div",{style:{padding:16},children:[p.jsxs("div",{style:{fontSize:15,fontWeight:600,marginBottom:12},children:[I("Your Cart","तुमची कार्ट")," ",y&&`· ${y.storeName}`]}),f.length===0&&p.jsx("div",{style:{textAlign:"center",color:"#9ca3af",padding:40,fontSize:13},children:"Cart is empty. Browse vendors to add items!"}),f.map(D=>p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f3f4f6"},children:[p.jsxs("div",{children:[p.jsx("div",{style:{fontSize:13,fontWeight:500},children:D.name}),p.jsxs("div",{style:{fontSize:12,color:"#6b7280"},children:["₹",D.price," each"]})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[p.jsx("button",{onClick:()=>A(D.id,-1),style:{width:28,height:28,borderRadius:"50%",border:"1px solid #E24B4A",background:"transparent",color:"#E24B4A",cursor:"pointer",fontSize:16},children:"-"}),p.jsx("span",{style:{fontSize:13,fontWeight:600,minWidth:16,textAlign:"center"},children:D.qty}),p.jsx("button",{onClick:()=>A(D.id,1),style:{width:28,height:28,borderRadius:"50%",border:"none",background:"#E24B4A",color:"#fff",cursor:"pointer",fontSize:16},children:"+"})]}),p.jsxs("div",{style:{fontSize:13,fontWeight:600,minWidth:48,textAlign:"right"},children:["₹",D.price*D.qty]})]},D.id)),f.length>0&&!_&&p.jsxs(p.Fragment,{children:[p.jsxs("div",{style:{background:"#f9fafb",borderRadius:10,padding:12,margin:"12px 0"},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6},children:[p.jsx("span",{style:{fontSize:12,color:"#6b7280"},children:"Subtotal"}),p.jsxs("span",{style:{fontSize:12},children:["₹",ke]})]}),p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6},children:[p.jsx("span",{style:{fontSize:12,color:"#6b7280"},children:"Delivery fee"}),p.jsx("span",{style:{fontSize:12},children:"₹30"})]}),p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",borderTop:"1px solid #e5e7eb",paddingTop:8},children:[p.jsx("span",{style:{fontSize:14,fontWeight:600},children:"Total"}),p.jsxs("span",{style:{fontSize:14,fontWeight:600},children:["₹",ke+30]})]})]}),p.jsxs("button",{onClick:()=>T(!0),style:{width:"100%",background:"#E24B4A",color:"#fff",border:"none",padding:14,borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Poppins"},children:["Proceed to Checkout · ₹",ke+30]})]}),f.length>0&&_&&p.jsxs("div",{style:{marginTop:12},children:[p.jsx("div",{style:{fontSize:14,fontWeight:600,marginBottom:12},children:"Delivery Details"}),p.jsxs("div",{style:{marginBottom:10},children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Hostel Name"}),p.jsx("input",{style:$,placeholder:"e.g. Hostel B, Men's Hostel...",value:j,onChange:D=>g(D.target.value)})]}),p.jsxs("div",{style:{marginBottom:10},children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Room Number / Address"}),p.jsx("input",{style:$,placeholder:"e.g. Room 204 or Full address",value:N,onChange:D=>V(D.target.value)})]}),p.jsxs("div",{style:{background:"#fef3c7",borderRadius:9,padding:"10px 12px",fontSize:12,color:"#78350f",marginBottom:12},children:["💵 Payment: ",p.jsx("strong",{children:"Cash on Delivery (COD)"})]}),p.jsxs("button",{onClick:Tr,style:{width:"100%",background:"#E24B4A",color:"#fff",border:"none",padding:14,borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Poppins",marginBottom:8},children:["🎉 Place Order · ₹",ke+30]}),p.jsx("button",{onClick:()=>T(!1),style:{width:"100%",background:"transparent",color:"#E24B4A",border:"1px solid #E24B4A",padding:11,borderRadius:10,fontSize:13,cursor:"pointer",fontFamily:"Poppins"},children:"Back to Cart"})]})]}),n==="orders"&&p.jsxs("div",{style:{padding:16},children:[p.jsx("div",{style:{fontSize:15,fontWeight:600,marginBottom:12},children:I("My Orders","माझे ऑर्डर")}),C.length===0&&p.jsx("div",{style:{textAlign:"center",color:"#9ca3af",padding:40,fontSize:13},children:"No orders yet. Order something delicious!"}),C.map(D=>{var K,le,Z,ue,Ct;return p.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:14,marginBottom:10},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6},children:[p.jsx("div",{style:{fontSize:13,fontWeight:600},children:D.vendorName}),p.jsx("span",{style:{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:10,background:D.status==="delivered"?"#d1fae5":D.status==="cancelled"?"#fee2e2":D.status==="preparing"?"#dbeafe":"#fef3c7",color:D.status==="delivered"?"#065f46":D.status==="cancelled"?"#991b1b":D.status==="preparing"?"#1e40af":"#92400e"},children:(K=D.status)==null?void 0:K.replace("_"," ")})]}),p.jsx("div",{style:{fontSize:12,color:"#6b7280",marginBottom:6},children:(le=D.items)==null?void 0:le.map(Pt=>`${Pt.qty}x ${Pt.name}`).join(", ")}),p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[p.jsxs("span",{style:{fontSize:13,fontWeight:600},children:["₹",D.total]}),p.jsx("span",{style:{fontSize:11,color:"#9ca3af"},children:((Ct=(ue=(Z=D.createdAt)==null?void 0:Z.toDate)==null?void 0:ue.call(Z))==null?void 0:Ct.toLocaleDateString("en-IN"))||""})]}),D.address&&p.jsxs("div",{style:{fontSize:11,color:"#9ca3af",marginTop:4},children:["📍 ",D.address]})]},D.id)})]}),n==="profile"&&p.jsxs("div",{style:{padding:16},children:[p.jsxs("div",{style:{textAlign:"center",padding:"20px 0 16px"},children:[p.jsx("div",{style:{width:64,height:64,borderRadius:"50%",background:"#FCEBEB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"},children:"👤"}),p.jsx("div",{style:{fontSize:16,fontWeight:600},children:(e==null?void 0:e.name)||"User"}),p.jsx("div",{style:{fontSize:13,color:"#6b7280"},children:t==null?void 0:t.email})]}),p.jsx("div",{style:{background:"#f9fafb",borderRadius:10,padding:12,marginBottom:10},children:p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[p.jsx("span",{style:{fontSize:13},children:"Language"}),p.jsx("button",{onClick:()=>S(D=>D==="en"?"mr":"en"),style:{background:"#FCEBEB",color:"#A32D2D",border:"none",padding:"5px 12px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"Poppins"},children:E==="en"?"Switch to Marathi":"English वर जा"})]})}),p.jsx("button",{onClick:()=>Gr(),style:{width:"100%",background:"transparent",color:"#E24B4A",border:"1px solid #E24B4A",padding:12,borderRadius:10,fontSize:13,cursor:"pointer",fontFamily:"Poppins",fontWeight:500},children:"Logout"})]})]}),f.length>0&&(n==="home"||n==="vendor-menu")&&p.jsxs("div",{onClick:()=>r("cart"),style:{background:"#E24B4A",color:"#fff",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",flexShrink:0},children:[p.jsxs("span",{style:{fontSize:13},children:[Rt," item",Rt>1?"s":""," · ₹",ke]}),p.jsx("strong",{style:{fontSize:14},children:"View Cart →"})]}),p.jsx("div",{style:oi.bottomNav,children:[{id:"home",icon:"🏠",label:I("Home","मुख्यपृष्ठ")},{id:"orders",icon:"📋",label:I("Orders","ऑर्डर")},{id:"cart",icon:"🛒",label:`${I("Cart","कार्ट")}${Rt>0?` (${Rt})`:""}`},{id:"profile",icon:"👤",label:I("Profile","प्रोफाइल")}].map(D=>p.jsxs("button",{style:oi.bnItem(n===D.id),onClick:()=>r(D.id),children:[p.jsx("span",{style:{fontSize:20},children:D.icon}),p.jsx("span",{style:{fontSize:10,color:n===D.id?"#E24B4A":"#6b7280",fontWeight:500},children:D.label})]},D.id))})]})}const wy={pending:"accepted",accepted:"preparing",preparing:"ready",ready:"out_for_delivery",out_for_delivery:"delivered"},l2={pending:"Accept Order",accepted:"Start Preparing",preparing:"Mark Ready",ready:"Out for Delivery",out_for_delivery:"Mark Delivered"};function u2(){const{user:t,userData:e}=Pu(),[n,r]=B.useState("orders"),[i,s]=B.useState([]),[o,l]=B.useState([]),[u,d]=B.useState(!1),[f,m]=B.useState(!1),[y,R]=B.useState({name:"",price:"",category:"Thali"});B.useEffect(()=>{if(!t)return;d((e==null?void 0:e.isOpen)||!1);const g=r2(t.uid,s),_=cE(t.uid,l);return()=>{g(),_()}},[t,e]);const C=async()=>{const g=!u;d(g),await Jx(t.uid,{isOpen:g}),ne.success(g?"🟢 Store is now Open!":"🔴 Store is now Closed")},b=async(g,_)=>{const T=wy[_];T&&(await vy(g,T),ne.success(`Order → ${T.replace("_"," ")}`))},L=async g=>{await vy(g,"cancelled"),ne.error("Order rejected")},w=async()=>{if(!y.name||!y.price)return ne.error("Fill name and price");if(isNaN(y.price)||Number(y.price)<=0)return ne.error("Enter valid price");await Zx(t.uid,{...y,price:Number(y.price)}),R({name:"",price:"",category:"Thali"}),m(!1),ne.success("Item added to menu!")},E=i.filter(g=>!["delivered","cancelled"].includes(g.status)),S=i.filter(g=>["delivered","cancelled"].includes(g.status)),N=i.filter(g=>g.status==="delivered").reduce((g,_)=>g+(_.total||0),0),V={width:"100%",padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,fontFamily:"Poppins,sans-serif",outline:"none",marginTop:4},j={...V,cursor:"pointer"};return p.jsxs("div",{style:{maxWidth:430,margin:"0 auto",background:"#fff",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"Poppins,sans-serif"},children:[p.jsx("div",{style:{background:"#1a1a1a",padding:16,flexShrink:0},children:p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[p.jsxs("div",{children:[p.jsx("div",{style:{fontSize:15,fontWeight:600,color:"#fff"},children:(e==null?void 0:e.storeName)||"My Store"}),p.jsxs("div",{style:{fontSize:11,color:"#aaa",marginTop:2},children:["Prep: ",(e==null?void 0:e.prepTime)||20," min · ",(e==null?void 0:e.category)||"Food"]})]}),p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[p.jsx("span",{style:{fontSize:11,color:u?"#4ade80":"#9ca3af"},children:u?"Open":"Closed"}),p.jsx("div",{onClick:C,style:{width:44,height:24,background:u?"#16a34a":"#6b7280",borderRadius:12,cursor:"pointer",position:"relative",transition:"background 0.2s"},children:p.jsx("div",{style:{position:"absolute",width:18,height:18,background:"#fff",borderRadius:"50%",top:3,left:u?23:3,transition:"left 0.2s"}})})]})]})}),p.jsx("div",{style:{display:"flex",background:"#111",overflowX:"auto",flexShrink:0},children:[{id:"orders",label:`Orders${E.length>0?` (${E.length})`:""}`},{id:"menu",label:"Menu"},{id:"earnings",label:"Earnings"},{id:"settings",label:"Settings"}].map(g=>p.jsx("button",{onClick:()=>r(g.id),style:{flexShrink:0,padding:"11px 16px",fontSize:12,fontWeight:500,color:n===g.id?"#E24B4A":"#888",borderBottom:n===g.id?"2px solid #E24B4A":"2px solid transparent",background:"transparent",border:"none",borderBottom:n===g.id?"2px solid #E24B4A":"2px solid transparent",cursor:"pointer",fontFamily:"Poppins",whiteSpace:"nowrap"},children:g.label},g.id))}),p.jsxs("div",{style:{flex:1,overflowY:"auto",padding:14},children:[n==="orders"&&p.jsxs(p.Fragment,{children:[E.length===0&&p.jsx("div",{style:{textAlign:"center",color:"#9ca3af",padding:32,fontSize:13},children:"No active orders right now"}),E.map(g=>{var _,T;return p.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:14,marginBottom:10},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},children:[p.jsxs("div",{children:[p.jsxs("div",{style:{fontSize:13,fontWeight:600},children:["#",g.id.slice(-6).toUpperCase()]}),p.jsxs("div",{style:{fontSize:11,color:"#6b7280",marginTop:2},children:[g.userName," · ",g.userPhone]}),p.jsxs("div",{style:{fontSize:11,color:"#6b7280"},children:["📍 ",g.address]})]}),p.jsx("span",{style:{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:10,background:g.status==="pending"?"#fef3c7":"#dbeafe",color:g.status==="pending"?"#92400e":"#1e40af"},children:(_=g.status)==null?void 0:_.replace("_"," ")})]}),p.jsx("div",{style:{fontSize:12,color:"#6b7280",marginBottom:8},children:(T=g.items)==null?void 0:T.map(I=>`${I.qty}x ${I.name}`).join(", ")}),p.jsxs("div",{style:{fontSize:14,fontWeight:600,marginBottom:10},children:["₹",g.total," · COD"]}),p.jsxs("div",{style:{display:"flex",gap:8},children:[g.status==="pending"&&p.jsx("button",{onClick:()=>L(g.id),style:{background:"transparent",color:"#E24B4A",border:"1px solid #E24B4A",padding:"8px 14px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"Poppins"},children:"Reject"}),wy[g.status]&&p.jsx("button",{onClick:()=>b(g.id,g.status),style:{flex:1,background:g.status==="pending"?"#E24B4A":"#1a1a1a",color:"#fff",border:"none",padding:"8px 14px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"Poppins",fontWeight:500},children:l2[g.status]})]})]},g.id)}),S.length>0&&p.jsxs(p.Fragment,{children:[p.jsx("div",{style:{fontSize:12,color:"#9ca3af",margin:"8px 0 6px",textTransform:"uppercase",letterSpacing:.5},children:"Past Orders"}),S.slice(0,10).map(g=>{var _;return p.jsxs("div",{style:{background:"#f9fafb",border:"1px solid #f3f4f6",borderRadius:10,padding:12,marginBottom:8,opacity:.7},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[p.jsxs("div",{style:{fontSize:12},children:["#",g.id.slice(-6).toUpperCase()," · ",(_=g.items)==null?void 0:_.length," item(s)"]}),p.jsx("span",{style:{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:g.status==="delivered"?"#d1fae5":"#fee2e2",color:g.status==="delivered"?"#065f46":"#991b1b"},children:g.status})]}),p.jsxs("div",{style:{fontSize:13,fontWeight:600,marginTop:4},children:["₹",g.total]})]},g.id)})]})]}),n==="menu"&&p.jsxs(p.Fragment,{children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},children:[p.jsxs("span",{style:{fontSize:13,color:"#6b7280"},children:[o.length," items in menu"]}),p.jsx("button",{onClick:()=>m(!f),style:{background:"#E24B4A",color:"#fff",border:"none",padding:"7px 14px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"Poppins",fontWeight:500},children:"+ Add Item"})]}),f&&p.jsxs("div",{style:{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:12,padding:14,marginBottom:14},children:[p.jsx("div",{style:{fontSize:13,fontWeight:600,marginBottom:10},children:"New Menu Item"}),p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:8},children:[p.jsx("input",{style:V,placeholder:"Item name *",value:y.name,onChange:g=>R(_=>({..._,name:g.target.value}))}),p.jsx("input",{style:V,type:"number",placeholder:"Price (₹) *",value:y.price,onChange:g=>R(_=>({..._,price:g.target.value}))}),p.jsx("select",{style:j,value:y.category,onChange:g=>R(_=>({..._,category:g.target.value})),children:["Thali","Biryani","Chinese","Snacks","Drinks","Sweets","Roti","Rice"].map(g=>p.jsx("option",{children:g},g))}),p.jsxs("div",{style:{display:"flex",gap:8},children:[p.jsx("button",{onClick:w,style:{flex:1,background:"#E24B4A",color:"#fff",border:"none",padding:10,borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"Poppins",fontWeight:500},children:"Add Item"}),p.jsx("button",{onClick:()=>m(!1),style:{flex:1,background:"transparent",color:"#6b7280",border:"1px solid #e5e7eb",padding:10,borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"Poppins"},children:"Cancel"})]})]})]}),o.length===0&&!f&&p.jsx("div",{style:{textAlign:"center",color:"#9ca3af",padding:32,fontSize:13},children:"No items yet. Add your first menu item!"}),o.map(g=>p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #f3f4f6"},children:[p.jsxs("div",{style:{flex:1},children:[p.jsx("div",{style:{fontSize:13,fontWeight:500},children:g.name}),p.jsxs("div",{style:{fontSize:12,color:"#6b7280"},children:["₹",g.price," · ",g.category]})]}),p.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[p.jsx("div",{onClick:()=>e2(t.uid,g.id,{available:!g.available}),style:{width:40,height:22,background:g.available?"#16a34a":"#d1d5db",borderRadius:11,cursor:"pointer",position:"relative",transition:"background 0.2s"},children:p.jsx("div",{style:{position:"absolute",width:16,height:16,background:"#fff",borderRadius:"50%",top:3,left:g.available?21:3,transition:"left 0.2s"}})}),p.jsx("button",{onClick:()=>{t2(t.uid,g.id),ne.success("Item deleted")},style:{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#dc2626",padding:4},children:"🗑️"})]})]},g.id))]}),n==="earnings"&&p.jsxs(p.Fragment,{children:[p.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14},children:[{label:"Today's Sales",val:`₹${N.toLocaleString()}`,sub:`${i.filter(g=>g.status==="delivered").length} delivered`},{label:"Total Orders",val:i.length,sub:`${E.length} active`},{label:"COD Collected",val:`₹${N.toLocaleString()}`,sub:"pending settlement"},{label:"Menu Items",val:o.length,sub:`${o.filter(g=>g.available).length} available`}].map(g=>p.jsxs("div",{style:{background:"#f9fafb",borderRadius:10,padding:12},children:[p.jsx("div",{style:{fontSize:11,color:"#6b7280",marginBottom:4},children:g.label}),p.jsx("div",{style:{fontSize:20,fontWeight:600},children:g.val}),p.jsx("div",{style:{fontSize:10,color:"#16a34a",marginTop:2},children:g.sub})]},g.label))}),p.jsxs("div",{style:{background:"#f9fafb",borderRadius:10,padding:12},children:[p.jsx("div",{style:{fontSize:13,fontWeight:600,marginBottom:8},children:"Recent Delivered Orders"}),i.filter(g=>g.status==="delivered").slice(0,5).map(g=>{var _;return p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #e5e7eb"},children:[p.jsxs("span",{style:{fontSize:12},children:[g.userName," · ",(_=g.items)==null?void 0:_.length," item(s)"]}),p.jsxs("span",{style:{fontSize:12,fontWeight:600},children:["₹",g.total]})]},g.id)}),i.filter(g=>g.status==="delivered").length===0&&p.jsx("div",{style:{fontSize:12,color:"#9ca3af",textAlign:"center",padding:16},children:"No delivered orders yet"})]})]}),n==="settings"&&p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[p.jsxs("div",{style:{background:"#f9fafb",borderRadius:12,padding:14},children:[p.jsx("div",{style:{fontSize:13,fontWeight:600,marginBottom:12},children:"Store Info"}),[{label:"Store Name",val:e==null?void 0:e.storeName},{label:"Email",val:e==null?void 0:e.email},{label:"Phone / WhatsApp",val:e==null?void 0:e.phone},{label:"Address",val:e==null?void 0:e.address},{label:"Category",val:e==null?void 0:e.category},{label:"Subscription Plan",val:e==null?void 0:e.plan}].map(g=>p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #e5e7eb"},children:[p.jsx("span",{style:{fontSize:12,color:"#6b7280"},children:g.label}),p.jsx("span",{style:{fontSize:12,fontWeight:500},children:g.val||"—"})]},g.label))]}),p.jsx("button",{onClick:()=>Gr(),style:{width:"100%",background:"transparent",color:"#E24B4A",border:"1px solid #E24B4A",padding:12,borderRadius:10,fontSize:13,cursor:"pointer",fontFamily:"Poppins",fontWeight:500},children:"Logout"})]})]})]})}function c2(){const{user:t}=Pu(),[e,n]=B.useState("overview"),[r,i]=B.useState([]),[s,o]=B.useState([]),[l,u]=B.useState(!1),[d,f]=B.useState({storeName:"",email:"",phone:"",password:"",confirmPass:"",address:"",category:"Thali",plan:"₹500/month"});B.useEffect(()=>{const w=s2(i),E=uE(o);return()=>{w(),E()}},[]);const m=r.filter(w=>{var N,V;const E=(V=(N=w.createdAt)==null?void 0:N.toDate)==null?void 0:V.call(N);if(!E)return!1;const S=new Date;return E.getDate()===S.getDate()&&E.getMonth()===S.getMonth()}),y=m.filter(w=>w.status==="delivered").reduce((w,E)=>w+(E.total||0),0),R=s.length*500,C=w=>({value:d[w],onChange:E=>f(S=>({...S,[w]:E.target.value}))}),b=async()=>{const{storeName:w,email:E,password:S,confirmPass:N,plan:V,category:j,address:g,phone:_}=d;if(!w)return ne.error("Store name required");if(!E)return ne.error("Email required");if(!S)return ne.error("Password required");if(S.length<6)return ne.error("Password must be 6+ characters");if(S!==N)return ne.error("Passwords do not match");u(!0);try{await Xx(t.uid,{email:E,password:S,storeName:w,address:g,phone:_,plan:V,category:j}),ne.success(`✅ Vendor "${w}" created! They can login with ${E}`),f({storeName:"",email:"",phone:"",password:"",confirmPass:"",address:"",category:"Thali",plan:"₹500/month"}),n("vendors")}catch(T){const I=T.code==="auth/email-already-in-use"?"This email is already registered":T.code==="auth/invalid-email"?"Invalid email format":T.message||"Failed to create vendor";ne.error(I)}finally{u(!1)}},L={width:"100%",padding:"11px 13px",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,fontFamily:"Poppins,sans-serif",outline:"none",marginTop:4};return p.jsxs("div",{style:{maxWidth:430,margin:"0 auto",background:"#fff",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"Poppins,sans-serif"},children:[p.jsxs("div",{style:{background:"#111",padding:16,flexShrink:0},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[p.jsx("div",{style:{width:8,height:8,background:"#E24B4A",borderRadius:"50%"}}),p.jsx("span",{style:{fontSize:18,fontWeight:700,color:"#fff"},children:"FeedoZone"}),p.jsx("span",{style:{fontSize:11,color:"#555"},children:"Founder"})]}),p.jsx("div",{style:{fontSize:11,color:"#555",marginTop:4},children:"Warananagar, Kolhapur"})]}),p.jsx("div",{style:{display:"flex",background:"#0a0a0a",overflowX:"auto",flexShrink:0},children:[{id:"overview",label:"Overview"},{id:"orders",label:`Orders (${m.length})`},{id:"vendors",label:`Vendors (${s.length})`},{id:"addvendor",label:"+ Add Vendor"}].map(w=>p.jsx("button",{onClick:()=>n(w.id),style:{flexShrink:0,padding:"11px 14px",fontSize:12,fontWeight:500,color:e===w.id?"#E24B4A":"#666",borderBottom:e===w.id?"2px solid #E24B4A":"2px solid transparent",background:"transparent",border:"none",borderBottom:e===w.id?"2px solid #E24B4A":"2px solid transparent",cursor:"pointer",fontFamily:"Poppins",whiteSpace:"nowrap"},children:w.label},w.id))}),p.jsxs("div",{style:{flex:1,overflowY:"auto",padding:14},children:[e==="overview"&&p.jsxs(p.Fragment,{children:[p.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16},children:[p.jsxs("div",{style:{background:"#E24B4A",borderRadius:10,padding:12},children:[p.jsx("div",{style:{fontSize:10,color:"rgba(255,255,255,0.8)",marginBottom:6,textTransform:"uppercase",letterSpacing:.5},children:"Today Orders"}),p.jsx("div",{style:{fontSize:22,fontWeight:600,color:"#fff"},children:m.length}),p.jsx("div",{style:{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:2},children:"live updates"})]}),[{label:"Today Revenue",val:`₹${y.toLocaleString()}`,sub:`avg ₹${m.length?Math.round(y/m.length):0}`},{label:"Subscriptions",val:`₹${R.toLocaleString()}`,sub:"this month"},{label:"Active Vendors",val:`${s.filter(w=>w.isOpen).length}/${s.length}`,sub:`${s.length-s.filter(w=>w.isOpen).length} offline`}].map(w=>p.jsxs("div",{style:{background:"#f9fafb",borderRadius:10,padding:12},children:[p.jsx("div",{style:{fontSize:10,color:"#6b7280",marginBottom:6,textTransform:"uppercase",letterSpacing:.5},children:w.label}),p.jsx("div",{style:{fontSize:22,fontWeight:600},children:w.val}),p.jsx("div",{style:{fontSize:11,color:"#6b7280",marginTop:2},children:w.sub})]},w.label))]}),p.jsx("button",{onClick:()=>Gr(),style:{width:"100%",background:"transparent",color:"#E24B4A",border:"1px solid #E24B4A",padding:11,borderRadius:10,fontSize:13,cursor:"pointer",fontFamily:"Poppins",fontWeight:500},children:"Logout"})]}),e==="orders"&&p.jsxs(p.Fragment,{children:[p.jsx("div",{style:{fontSize:12,color:"#6b7280",marginBottom:10},children:"All orders · live"}),r.length===0&&p.jsx("div",{style:{textAlign:"center",color:"#9ca3af",padding:40,fontSize:13},children:"No orders yet"}),r.slice(0,50).map(w=>{var E,S,N,V;return p.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f3f4f6"},children:[p.jsx("div",{style:{fontSize:11,color:"#9ca3af",minWidth:42},children:((N=(S=(E=w.createdAt)==null?void 0:E.toDate)==null?void 0:S.call(E))==null?void 0:N.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}))||"--"}),p.jsxs("div",{style:{flex:1},children:[p.jsx("div",{style:{fontSize:12,fontWeight:600},children:w.userName}),p.jsx("div",{style:{fontSize:11,color:"#6b7280"},children:w.vendorName})]}),p.jsxs("div",{style:{fontSize:13,fontWeight:600,minWidth:48,textAlign:"right"},children:["₹",w.total]}),p.jsx("span",{style:{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:8,minWidth:55,textAlign:"center",background:w.status==="delivered"?"#d1fae5":w.status==="cancelled"?"#fee2e2":w.status==="preparing"?"#dbeafe":"#fef3c7",color:w.status==="delivered"?"#065f46":w.status==="cancelled"?"#991b1b":w.status==="preparing"?"#1e40af":"#92400e"},children:(V=w.status)==null?void 0:V.replace("_"," ")})]},w.id)})]}),e==="vendors"&&p.jsxs(p.Fragment,{children:[p.jsxs("div",{style:{fontSize:12,color:"#6b7280",marginBottom:10},children:[s.length," registered vendors"]}),s.length===0&&p.jsx("div",{style:{textAlign:"center",color:"#9ca3af",padding:40,fontSize:13},children:"No vendors yet. Add your first vendor!"}),s.map(w=>p.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:14,marginBottom:10},children:[p.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[p.jsx("div",{style:{width:7,height:7,borderRadius:"50%",background:w.isOpen?"#16a34a":"#d1d5db"}}),p.jsx("span",{style:{fontSize:14,fontWeight:600},children:w.storeName})]}),p.jsx("span",{style:{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8,background:w.subscriptionStatus==="active"?"#d1fae5":"#fee2e2",color:w.subscriptionStatus==="active"?"#065f46":"#991b1b"},children:w.subscriptionStatus==="active"?"Paid":"Due"})]}),p.jsxs("div",{style:{fontSize:11,color:"#9ca3af",marginBottom:8},children:[w.email," · ",w.category]}),p.jsx("div",{style:{display:"flex",gap:16},children:[{val:w.totalOrders||0,lbl:"Orders"},{val:`${w.onTimePercent||100}%`,lbl:"On-time"},{val:`${w.avgPrepTime||w.prepTime||20}m`,lbl:"Avg prep"},{val:w.plan||"₹500/mo",lbl:"Plan"}].map(E=>p.jsxs("div",{style:{textAlign:"center"},children:[p.jsx("div",{style:{fontSize:13,fontWeight:600},children:E.val}),p.jsx("div",{style:{fontSize:10,color:"#6b7280"},children:E.lbl})]},E.lbl))})]},w.id))]}),e==="addvendor"&&p.jsxs("div",{style:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:16},children:[p.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:16},children:[p.jsx("span",{style:{fontSize:14,fontWeight:600},children:"Create Vendor Account"}),p.jsx("span",{style:{fontSize:10,background:"#FCEBEB",color:"#A32D2D",padding:"2px 8px",borderRadius:10,fontWeight:600},children:"Founder Only"})]}),p.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Store / Vendor Name *"}),p.jsx("input",{style:L,placeholder:"e.g. Shree Ganesh Thali",...C("storeName")})]}),p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Vendor Email * (used for login)"}),p.jsx("input",{style:L,type:"email",placeholder:"vendor@example.com",...C("email")})]}),p.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:[p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Password *"}),p.jsx("input",{style:L,type:"password",placeholder:"Min 6 chars",...C("password")})]}),p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Confirm *"}),p.jsx("input",{style:L,type:"password",placeholder:"Repeat",...C("confirmPass")})]})]}),p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Phone / WhatsApp"}),p.jsx("input",{style:L,placeholder:"+91 98765 43210",...C("phone")})]}),p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Store Address"}),p.jsx("input",{style:L,placeholder:"Near college gate, Warananagar...",...C("address")})]}),p.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:[p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Category"}),p.jsx("select",{style:{...L,cursor:"pointer",marginTop:4},...C("category"),children:["Thali","Biryani","Chinese","Snacks","Drinks","Sweets"].map(w=>p.jsx("option",{children:w},w))})]}),p.jsxs("div",{children:[p.jsx("label",{style:{fontSize:12,color:"#6b7280",fontWeight:500},children:"Plan"}),p.jsxs("select",{style:{...L,cursor:"pointer",marginTop:4},...C("plan"),children:[p.jsx("option",{children:"₹500/month"}),p.jsx("option",{children:"₹1000/month"}),p.jsx("option",{children:"Free Trial"})]})]})]}),p.jsx("button",{onClick:b,disabled:l,style:{width:"100%",background:l?"#f09595":"#E24B4A",color:"#fff",border:"none",padding:13,borderRadius:10,fontSize:14,fontWeight:600,cursor:l?"not-allowed":"pointer",fontFamily:"Poppins",marginTop:4},children:l?"Creating Account...":"✅ Create Vendor Account"})]}),p.jsx("div",{style:{marginTop:14,padding:12,background:"#f0fdf4",borderRadius:10,fontSize:12,color:"#166534"},children:'💡 After creating, share the email + password with the vendor. They select "Vendor" tab on login screen and use those credentials.'})]})]})]})}function d2(){const[t,e]=B.useState(""),[n,r]=B.useState(""),[i,s]=B.useState(!1),o=async u=>{if(u.preventDefault(),!t||!n)return ne.error("Enter email and password");s(!0);try{const f=(await lE(t,n)).user.uid,m=await Hf(jt(Fe,"users",f));if(!m.exists()){await Gr(),ne.error("Account not found."),s(!1);return}const y=m.data();if(y.role!=="founder"){await Gr(),ne.error("Access denied. This portal is for FeedoZone founder only."),s(!1);return}ne.success(`Welcome back, ${y.name||"Founder"}! 👑`),setTimeout(()=>{window.location.href="/founder"},500)}catch(d){const f=d.code==="auth/invalid-credential"?"Wrong email or password":d.code==="auth/user-not-found"?"No account found":d.code==="auth/invalid-email"?"Invalid email format":d.code==="auth/too-many-requests"?"Too many attempts. Try again later.":"Login failed. Try again.";ne.error(f),s(!1)}},l={width:"100%",padding:"13px 14px",border:"1.5px solid #2a2a2a",borderRadius:10,fontSize:14,fontFamily:"Poppins, sans-serif",outline:"none",background:"#1a1a1a",color:"#fff",boxSizing:"border-box"};return p.jsxs("div",{style:{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:"#0d0d0d",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",fontFamily:"Poppins, sans-serif"},children:[p.jsxs("div",{style:{textAlign:"center",marginBottom:36},children:[p.jsx("div",{style:{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg, #E24B4A, #c73b3a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px",boxShadow:"0 0 24px rgba(226,75,74,0.35)"},children:"👑"}),p.jsx("div",{style:{fontSize:22,fontWeight:700,color:"#fff",letterSpacing:-.5},children:"Founder Portal"}),p.jsx("div",{style:{fontSize:12,color:"#555",marginTop:5},children:"FeedoZone · Warananagar, Kolhapur"})]}),p.jsx("div",{style:{width:"100%",padding:"10px 14px",background:"#1a0f0f",border:"1px solid #3a1a1a",borderRadius:10,fontSize:12,color:"#E24B4A",marginBottom:24,textAlign:"center",letterSpacing:.2},children:"🔒 Restricted access · Authorized personnel only"}),p.jsxs("form",{onSubmit:o,style:{width:"100%",display:"flex",flexDirection:"column",gap:12},children:[p.jsx("input",{type:"email",placeholder:"Founder email",value:t,onChange:u=>e(u.target.value),style:l,autoComplete:"username"}),p.jsx("input",{type:"password",placeholder:"Password",value:n,onChange:u=>r(u.target.value),style:l,autoComplete:"current-password"}),p.jsx("button",{type:"submit",disabled:i,style:{width:"100%",background:i?"#5a1a1a":"linear-gradient(135deg, #E24B4A, #c73b3a)",color:"#fff",border:"none",padding:14,borderRadius:10,fontSize:15,fontWeight:600,cursor:i?"not-allowed":"pointer",fontFamily:"Poppins, sans-serif",marginTop:4,boxShadow:i?"none":"0 4px 14px rgba(226,75,74,0.3)",transition:"all 0.15s"},children:i?"Verifying...":"👑 Enter Dashboard"})]}),p.jsx("div",{style:{marginTop:24,textAlign:"center"},children:p.jsx("span",{onClick:()=>window.location.href="/",style:{fontSize:12,color:"#444",cursor:"pointer",textDecoration:"underline"},children:"← Back to FeedoZone"})}),p.jsx("div",{style:{marginTop:40,fontSize:11,color:"#333",textAlign:"center"},children:"FeedoZone © 2025 · feedozone2030@gmail.com"})]})}function h2(){const{user:t,userData:e,loading:n}=Pu();if(B.useEffect(()=>{if(n)return;const s=window.location.pathname;if(s==="/founder-login")return;if(!t){s!=="/login"&&window.location.replace("/login");return}const o=e==null?void 0:e.role;o==="founder"&&!s.startsWith("/founder")?window.location.replace("/founder"):o==="vendor"&&!s.startsWith("/vendor")?window.location.replace("/vendor"):o==="user"&&!s.startsWith("/home")?window.location.replace("/home"):!o&&s!=="/login"&&window.location.replace("/login")},[n,t,e]),n)return p.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",fontFamily:"Poppins,sans-serif"},children:[p.jsx("div",{style:{fontSize:28,fontWeight:700,color:"#E24B4A",marginBottom:16},children:"Feedo"}),p.jsx("div",{style:{width:32,height:32,border:"3px solid #FCEBEB",borderTopColor:"#E24B4A",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}),p.jsx("style",{children:"@keyframes spin{to{transform:rotate(360deg)}}"})]});const r=window.location.pathname;if(r==="/founder-login")return p.jsx(d2,{});if(!t||r==="/login")return p.jsx(_y,{});const i=e==null?void 0:e.role;return i==="founder"&&r.startsWith("/founder")?p.jsx(c2,{}):i==="vendor"&&r.startsWith("/vendor")?p.jsx(u2,{}):i==="user"&&r.startsWith("/home")?p.jsx(a2,{}):p.jsx(_y,{})}Lc.createRoot(document.getElementById("root")).render(p.jsxs(Yx,{children:[p.jsx(h2,{}),p.jsx(tS,{position:"top-center",toastOptions:{style:{fontFamily:"Poppins, sans-serif",fontSize:"13px"},success:{iconTheme:{primary:"#16a34a",secondary:"#fff"}},error:{iconTheme:{primary:"#E24B4A",secondary:"#fff"}}}})]}));

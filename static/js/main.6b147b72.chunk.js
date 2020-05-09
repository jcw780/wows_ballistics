(this.webpackJsonpwows_ballistics_2=this.webpackJsonpwows_ballistics_2||[]).push([[0],{37:function(e,a,t){},41:function(e,a,t){e.exports=t(52)},46:function(e,a,t){},52:function(e,a,t){"use strict";t.r(a);var n=t(0),r=t.n(n),l=t(18),o=t.n(l),s=(t(46),t(37),t(33),t(10)),c=t(11),i=t(14),u=t(13),h=t(17),p=t(7),m=t(31),f=t(26),d=t(21),y=t(40),v=t(35),g=t.n(v),b=t(38),E=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(e){var n;return Object(s.a)(this,t),(n=a.call(this,e)).form=r.a.createRef(),n.state={options:[]},n.handleChange=function(e){e.stopPropagation(),n.props.handleValueChange(e.target.value,n.props.controlId)},n.updateOptions=function(e){n.setState((function(a){return{options:e}}))},n.state={options:[]},n.form=r.a.createRef(),n}return Object(c.a)(t,[{key:"render",value:function(){return r.a.createElement(h.a.Group,{className:"form-inline"},r.a.createElement(h.a.Label,{column:!0,sm:"6"},this.props.label),r.a.createElement(p.a,{sm:"2"},r.a.createElement(h.a.Control,{as:"select",placeholder:"",onChange:this.handleChange,ref:this.form},this.state.options.map((function(e,a){return r.a.createElement("option",{key:a},e)})))))}},{key:"componentDidUpdate",value:function(){this.props.handleValueChange(this.form.current.value,this.props.controlId)}}]),t}(r.a.Component),k="https://jcw780.github.io/wows_ballistics/static/data/";function w(e,a){fetch(e).then((function(e){if(!e.ok)throw new Error("Network response was not ok");return e.json()})).then(a).catch((function(e){console.error("There has been a problem with your fetch operation:",e)}))}function C(e){return fetch(e).then((function(e){if(!e.ok)throw new Error("Network response was not ok");return e.json()})).then((function(e){return e})).catch((function(e){console.error("There has been a problem with your fetch operation:",e)}))}var j=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(){var e;Object(s.a)(this,t);for(var n=arguments.length,l=new Array(n),o=0;o<n;o++)l[o]=arguments[o];return(e=a.call.apply(a,[this].concat(l))).defaultForms=Object.seal({version:["Version","",r.a.createRef(),0],nation:["Nation","",r.a.createRef(),0],shipType:["Type","",r.a.createRef(),0],ship:["Ship","",r.a.createRef(),0],artillery:["Artillery","",r.a.createRef(),0],shellType:["Shell Type","",r.a.createRef(),0]}),e.queriedData={},e.changeForm=function(a,t){switch(e.defaultForms[t][1]=a,e.defaultForms[t][3]){case 0:e.queryNation();break;case 1:e.queryType();break;case 2:e.queryShip();break;case 3:e.queryArtillery();break;case 4:e.queryShellType();break;case 5:e.sendData()}},e.updateForm=function(a,t){e.defaultForms[a][2].current.updateOptions(t)},e.queryVersion=function(){var a=e.updateForm;w(k+"versions.json",(function(e){var t=e.reverse();a("version",t)}))},e.queryNation=function(){var a=e.updateForm,t=e.defaultForms.version[1];w(k+t+"/nations.json",(function(e){a("nation",e)}))},e.queryType=function(){var a=e.updateForm,t=[e.defaultForms.version[1],e.defaultForms.nation[1]];w(k+t[0]+"/"+t[1]+"/shiptypes.json",(function(e){a("shipType",e)}))},e.queryShip=Object(b.a)(g.a.mark((function e(){var a,t,n;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=[this.defaultForms.version[1],this.defaultForms.nation[1],this.defaultForms.shipType[1]],e.next=3,C(k+a[0]+"/"+a[1]+"/"+a[1]+"_"+a[2]+".json");case 3:t=e.sent,this.queriedData=t,(n=Object.keys(t)).sort((function(e,a){return t[e].Tier-t[a].Tier})),this.updateForm("ship",n);case 8:case"end":return e.stop()}}),e,this)}))),e.queryArtillery=function(){var a=e.defaultForms.ship[1],t=e.queriedData[a],n=[];Object.keys(t).forEach((function(e){e.includes("Artillery")&&n.push(e)})),e.updateForm("artillery",n)},e.queryShellType=function(){var a=e.queriedData[e.defaultForms.ship[1]][e.defaultForms.artillery[1]];e.updateForm("shellType",Object.keys(a))},e.sendData=function(){e.props.sendDefault(e.queriedData[e.defaultForms.ship[1]][e.defaultForms.artillery[1]][e.defaultForms.shellType[1]],e.defaultForms.ship[1])},e}return Object(c.a)(t,[{key:"render",value:function(){var e=this;return r.a.createElement(h.a,null,Object.entries(this.defaultForms).map((function(a,t){var n=Object(y.a)(a,2),l=n[0],o=n[1];return e.defaultForms[l][3]=t,r.a.createElement(E,{label:o[0],key:t,controlId:l,handleValueChange:e.changeForm,ref:o[2]}," ")})))}}]),t}(r.a.Component),O=t(20),S=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(e){var n;return Object(s.a)(this,t),(n=a.call(this,e)).state={value:""},n.handleChange=function(e){n.updateValue(e.target.value),n.props.handleValueChange(e.target.value,n.props.controlId)},n.updateValue=function(e){n.setState((function(a){return{value:e}}))},n.state={value:n.props.newValue},n}return Object(c.a)(t,[{key:"render",value:function(){return r.a.createElement(h.a.Group,{className:"form-inline"},r.a.createElement(h.a.Label,{column:!0,sm:this.props.labelWidth},this.props.label),r.a.createElement(p.a,{sm:this.props.formWidth},r.a.createElement(h.a.Control,{type:this.props.type,value:this.state.value,placeholder:this.props.placeholder,onChange:this.handleChange})))}}]),t}(r.a.Component);S.defaultProps={labelWidth:6,formWidth:2,placeholder:""};var F=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(){var e;Object(s.a)(this,t);for(var n=arguments.length,l=new Array(n),o=0;o<n;o++)l[o]=arguments[o];return(e=a.call.apply(a,[this].concat(l))).nameForm=r.a.createRef(),e.handleValueChange=function(a,t){e.props.handleValueChange(a,t)},e}return Object(c.a)(t,[{key:"updateShells",value:function(){Object.entries(this.props.formLabels).forEach((function(e){var a=e[1];a[2].current.updateValue(a[1])}))}},{key:"render",value:function(){var e=this;return r.a.createElement(h.a,null,Object.entries(this.props.formLabels).map((function(a,t){var n=a[0],l=a[1];return r.a.createElement(S,{label:l[0],key:t,controlId:n,handleValueChange:e.handleValueChange,type:"number",newValue:l[1],ref:e.props.formLabels[n][2]})})))}},{key:"componentDidUpdate",value:function(){this.updateShells()}}]),t}(r.a.Component),A=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(){var e;Object(s.a)(this,t);for(var n=arguments.length,l=new Array(n),o=0;o<n;o++)l[o]=arguments[o];return(e=a.call.apply(a,[this].concat(l))).parameters=r.a.createRef(),e.defaults=r.a.createRef(),e.values=Object.seal({caliber:["Caliber (m)",0,r.a.createRef()],muzzleVelocity:["Muzzle Velocity",0,r.a.createRef()],dragCoefficient:["Drag Coefficient",0,r.a.createRef()],mass:["Mass (kg)",0,r.a.createRef()],krupp:["Krupp",0,r.a.createRef()],fusetime:["Fusetime (s)",0,r.a.createRef()],threshold:["Fusing Threshold (mm)",0,r.a.createRef()],normalization:["Normalization (\xb0)",0,r.a.createRef()],ra0:["Start Ricochet (\xb0)",0,r.a.createRef()],ra1:["Always Ricochet (\xb0)",0,r.a.createRef()],HESAP:["HE/SAP penetration (mm)",0,r.a.createRef()]}),e.name="",e.nameForm=r.a.createRef(),e.handleNameChange=function(a,t){e.name=a},e.handleValueChange=function(a,t){e.values[t][1]=parseFloat(a)},e.getDefaultData=function(a,t){e.values.caliber[1]=a.bulletDiametr,e.values.muzzleVelocity[1]=a.bulletSpeed,e.values.dragCoefficient[1]=a.bulletAirDrag,e.values.mass[1]=a.bulletMass,e.values.krupp[1]=a.bulletKrupp,e.values.fusetime[1]=a.bulletDetonator,e.values.threshold[1]=a.bulletDetonatorThreshold,e.values.normalization[1]=a.bulletCapNormalizeMaxAngle,e.values.ra0[1]=a.bulletRicochetAt,e.values.ra1[1]=a.bulletAlwaysRicochetAt,e.values.HESAP[1]=a.alphaPiercingHE,e.name=t,e.nameForm.current.updateValue(t),a.alphaPiercingCS>e.values.HESAP[1]&&(e.values.HESAP[1]=a.alphaPiercingCS),e.parameters.current&&e.parameters.current.updateShells()},e.deleteShip=function(){e.props.deleteShip(e.props.keyProp)},e}return Object(c.a)(t,[{key:"render",value:function(){return r.a.createElement(d.a.Dialog,null,r.a.createElement(d.a.Header,{closeButton:!0,onClick:this.deleteShip},r.a.createElement(d.a.Title,null,"Shell ",this.props.index+1)),r.a.createElement(d.a.Body,null,r.a.createElement(p.a,{sm:"4"},r.a.createElement(S,{label:"Ship Label",controlId:"shipName",handleValueChange:this.handleNameChange,type:"text",newValue:"",ref:this.nameForm}),r.a.createElement(j,{sendDefault:this.getDefaultData,ref:this.defaults}))),r.a.createElement(d.a.Footer,null,r.a.createElement(f.a,null,r.a.createElement(f.a.Toggle,{variant:"success",id:"dropdown-basic"},"Show Detailed Parameters"),r.a.createElement(f.a.Menu,null,r.a.createElement(f.a.Item,null,r.a.createElement(p.a,{sm:"10"},r.a.createElement(F,{handleValueChange:this.handleValueChange,formLabels:this.values,ref:this.parameters})))))))}},{key:"componentDidMount",value:function(){this.defaults.current.queryVersion()}}]),t}(r.a.Component),V=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(){var e;Object(s.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).state={keys:new Set([0,1])},e.addShip=function(){for(var a=0,t=!0,n=e.state.keys;t;)n.has(a)?a++:t=!1;e.setState((function(e){return{keys:e.keys.add(a)}}))},e.deleteShip=function(a){var t=e.state.keys;t.delete(a),e.setState((function(e){return{keys:t}}))},e}return Object(c.a)(t,[{key:"render",value:function(){var e=this;return r.a.createElement(r.a.Fragment,null,r.a.createElement("h2",null,"Shell Selection"),r.a.createElement("div",{className:"rows"},Array.from(this.state.keys).map((function(a,t){return r.a.createElement("div",{className:"row",key:a.toString()},r.a.createElement(p.a,{sm:"11"},r.a.createElement(A,{index:t,deleteShip:e.deleteShip,keyProp:a})))}))),r.a.createElement(m.a,null,r.a.createElement(p.a,null),r.a.createElement(p.a,{sm:"6"},r.a.createElement(O.a,{className:"form-control",onClick:this.addShip},"Add Ship")),r.a.createElement(p.a,null)))}}]),t}(r.a.Component),D=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(){var e;Object(s.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).deleteElement=function(){e.props.deleteElement(e.props.keyProp,parseInt(e.props.controlId))},e}return Object(c.a)(t,[{key:"render",value:function(){return r.a.createElement("div",{className:"row"},r.a.createElement(S,{controlId:this.props.controlId,newValue:this.props.newValue,handleValueChange:this.props.handleValueChange,type:"number",label:this.props.label,labelWidth:3,formWidth:4}))}}]),t}(r.a.Component);D.defaultProps={placeholder:""};var R=function(e){Object(i.a)(t,e);var a=Object(u.a)(t);function t(){var e;Object(s.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).state={angleKeys:new Set([0,1,2,3])},e.targetData={armor:70,inclination:0,angles:[0,5,10,15]},e.addAngle=function(){for(var a=0,t=!0,n=e.state.angleKeys;t;)n.has(a)?a++:t=!1;e.targetData.angles.push(5*e.targetData.angles.length),e.setState((function(e){return{angleKeys:e.angleKeys.add(a)}}))},e.deleteAngle=function(a,t){var n=e.state.angleKeys;n.delete(a),e.targetData.angles.splice(t,1),e.setState((function(e){return{angleKeys:n}}))},e.handleChange=function(a,t){e.targetData[t]=parseFloat(a)},e.handleAngleChange=function(a,t){e.targetData.angles[parseInt(t)]=parseFloat(a)},e}return Object(c.a)(t,[{key:"render",value:function(){var e=this,a=[];return Array.from(this.state.angleKeys).forEach((function(t,n){var l=r.a.createElement(D,{key:t,keyProp:t,controlId:n.toString(),newValue:e.targetData.angles[n],deleteElement:e.deleteAngle,handleValueChange:e.handleAngleChange,label:"Angle "+(n+1)}),o=Math.floor(n/2);n%2===0&&a.push([]),a[o].push(l)})),r.a.createElement(r.a.Fragment,null,r.a.createElement("h2",null,"Target Data"),r.a.createElement("div",{className:"row",style:{display:"flex",justifyContent:"center"}},r.a.createElement(S,{controlId:"armor",newValue:this.targetData.armor,handleValueChange:this.handleChange,type:"number",label:"Armor Thickness",labelWidth:4,formWidth:8}),r.a.createElement(S,{controlId:"inclination",newValue:this.targetData.inclination,handleValueChange:this.handleChange,type:"number",label:"Armor Inclination",labelWidth:4,formWidth:8})),r.a.createElement("div",{className:"rows"},a.map((function(e,a){return r.a.createElement("div",{className:"row",key:"R"+a},e.map((function(e){return e})))}))),r.a.createElement(m.a,null,r.a.createElement(p.a,null),r.a.createElement(p.a,{sm:"6"},r.a.createElement(O.a,{className:"form-control",onClick:this.addAngle},"Add Angle")),r.a.createElement(p.a,null)))}}]),t}(r.a.Component);var T=function(){return r.a.createElement("div",{className:"App"},r.a.createElement(V,null),r.a.createElement(R,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(T,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[41,1,2]]]);
//# sourceMappingURL=main.6b147b72.chunk.js.map
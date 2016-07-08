var clipBoard;

if (typeof selector === "undefined") { selector = {}; }

if(selector.addLibs === undefined){
	
	selector.addLibs = function(){
		var node = document.createElement("script");
		node.src = "jquery.min.js";
		document.body.appendChild(node);
		selector.nodeSelector();
	};
	
	selector.nodeSelector = function() {
		
		if (window.console === undefined) { window.console = {log:function(){}}; }	
		
		var frameName = "";

		var click =  function (ev) {
		
			clipBoard = ev.clipboardData;
			
			var btnNum = ev.button;
			
			if (btnNum != 2) {
				return;
			}

			ev.stopImmediatePropagation();
		    ev.preventDefault(); 
		    ev.stopPropagation();
		    ev.cancelBubble = true;   
		    ev.returnValue = false;

		    var e = $(ev.target);
		    var attrs = e.context.attributes;
			frameName = getFrameNameByElement(ev.target);

		    var id = getId(ev.target);
		    var name = getName(ev.target);
			var nodeName = getNode(ev.target);
			var parentNodeName = getParentNode(ev.target);
		    var ap = getAllXpath(ev.target);
			
			var xpathArray = new Array();
			var i = 0;
			var flag = true;
			var tempXpath;
			var nameFlag = false;
			
			if(getAttributeValue(ev.target,"id")!=-1){
				tempXpath = "//" + nodeName + "[@id='" + id + "']";

				if(isUnique(tempXpath)==1){
					flag =false;
					xpathArray.push(tempXpath);
				}
			}

			if(getAttributeValue(ev.target,"name")!=-1){
				tempXpath ="//" + nodeName + "[@name='" + name + "']";
				if(isUnique(tempXpath)==1){
					flag =false;
					xpathArray.push(tempXpath);
				}else{
					nameFlag =true;
				}
			}

			tempXpath = getXpathByText(ev.target);
			if(tempXpath!=null){
				if(isUnique(tempXpath)==1){
					flag =false;
					xpathArray.push(tempXpath);
				}else if(nameFlag ==true){
					tempXpath =tempXpath.replace("]","")+" and @name='" + name + "']";
					if(isUnique(tempXpath)==1){
						xpathArray.push(tempXpath);
					}
				}
			}
			
			
			var filter = ["value","title","href","class","style"];
			getXpathByAttr(filter,attrs,xpathArray,nodeName);

			if(flag){
				tempXpath= getXpathByParent(ev.target);
				if(tempXpath!=null && tempXpath!=ap){
					xpathArray.push(tempXpath);
				}

				tempXpath = getXpathByChlid(ev.target);
				if(tempXpath!=null && tempXpath!=ap){
					xpathArray.push(tempXpath);
				}

				tempXpath = getXpathByBrother(ev.target);
				if(tempXpath!=null && tempXpath!=ap){
					xpathArray.push(tempXpath);
				}
			}

			xpathArray.push(ap);

			var temp = sort(xpathArray);
			xpathArray = temp;

            var controlInfoArray = new Array();

            controlInfoArray.push(frameName);

            var type = "";


            if (nodeName == "input") {
                if(ev.target.type=="text" && ev.target.readOnly){
                    type = "Calendar";
                }else if(ev.target.type == "submit" || ev.target.type == "reset" || ev.target.type == "button" || ev.target.type == "image") {
                    type = "Click";
                }else if(this.type == "checkbox" || this.type == "radio"){
                    type = "Check";
                }else if(this.type == "file"){
                    type = "FileInput";
                }else{
                    type = "Text";
                }
            } else if (nodeName == "textarea") {
                type = "Text";
            }else if (nodeName == "select") {
                type = "Select";
            } else if (nodeName == "table") {
                type = "Table";
            } else if (nodeName == "a" || nodeName == "button"|| nodeName == "span" || nodeName == "img" || nodeName == "i" || nodeName == "font"|| nodeName == "div") {
				type = "Click";
			}else{
				type = "";
			}

			if (type != "") {
                controlInfoArray.push(type);

                var validXpathArray = new Array();

                var xpathSize = xpathArray.length;
                for (var k = 0; k < xpathSize && validXpathArray.length < 3; k++) {
                    if (isUnique(xpathArray[k])) {
                        validXpathArray.push(xpathArray[k]);
                    }
                }
                controlInfoArray.push(validXpathArray);

                var controlName = ev.target.id ? ev.target.id : (ev.target.name ? ev.target.name : "");
                controlName = controlName.replace(/[^a-zA-Z0-9]/, "");

                controlInfoArray.push(controlName);

                chrome.runtime.sendMessage(controlInfoArray);
            } else {
                chrome.runtime.sendMessage("rmSingleMenu");
            }
		};


		var all = $("*");

		$("*").each(function(){
			if($(this).is("frame")||$(this).is("iframe")) {
                try{
					if (this.contentWindow.document.domain == window.document.domain) {
						var framename = $(this)[0].name;
						var frameid = $(this)[0].id;
						var children;

						if (frameid != "") {
							children = $(window.frames[frameid].document).find("*")
						} else if (framename != "") {
							children = $(window.frames[framename].document).find("*")
						} else {
							children = $($(this)[0].contentWindow.document).find("*");
						}

						children.keydown(keydown);
						all.push(children);
					}
				} catch (e) {
					return true;
			}
            }
		});


		all.each(function() {
			$(this)
			.mousedown(click);
			});
		    
			
		var keydown = function(e) {
		    if (e.keyCode === undefined && e.charCode !== undefined) { e.keyCode = e.charCode; }
		    if (e.keyCode == 27) {
		    	$("*").each(function() {
		    		$(this)
		            .mouseout()
		            //.unbind("mouseover", mouseover)
		            //.unbind("mouseout", mouseout)
		            .unbind("mousedown", click)
		            .mouseout();
		    		if($(this).is("frame")||$(this).is("iframe")){
		    			var framename = $(this)[0].name;
		    			var children = $(window.frames[framename].document).find("*");
		    			children.each(function() {
		    				$(this)
		    		        .mouseout()
		    		        //.unbind("mouseover", mouseover)
		    		        //.unbind("mouseout", mouseout)
		    		        .unbind("mousedown", click)
		    		        .mouseout();
		    			});
		    			$(window.frames[framename].document).find("#hover").remove();
		    			$(window.frames[framename].document).unbind("keydown", keydown);
		    		}
		        });
		    	$("#hover").remove();
		    	$(document).unbind("keydown", keydown);
		    	selector.addLibs = undefined;
		    }
		};    
		    
		$(document).keydown(keydown);

		//获取元素所在frame或者iframe
        function getFrameNameByElement(e) {
            var frame;
            var frameName = "";
            var flag = true;
            $("iframe").each(function(){
                try{
                    if(e.ownerDocument === this.contentWindow.document) {
                        frame = this;
                        if(frame.name!=null && frame.name!="" && frame.name!=undefined){
                            frameName = frame.name;
                        }else{
                            frameName = frame.id;
                        }
                        flag = false;
                    }
                } catch (e) {
                    return true;
                }
            });
            if(flag){
                $("frame").each(function(){
                    try{
                        if(frame.name!=null && frame.name!="" && frame.name!=undefined) {
                            frame = this;
                            if(frame.name!=null){
                                frameName = frame.name;
                            }else{
                                frameName = frame.id;
                            }
                        }
                    } catch (e) {
                        return true;
                    }
                });
            }
            return frameName;
        }

		function getId(e) {
			return e.id;
		}

		function getName(e) {
			return e.name;
		}
		
		function getNode(e) {
			return e.nodeName.toLowerCase(); 
		}
		function getParentNode(e) {
			parentNode = e.parentNode;
			if(parentNode!=null && parentNode!=undefined){
				return parentNode.nodeName.toLowerCase();
			}else{
				return "";
			}

		}

		//获取绝对路径
		function getAllXpath(e) {
		    var xpath = "";
		    while (e.nodeName.toLowerCase() != "html") {
				var indexNode = getIndexOfElement(e);

		        if( indexNode != null ){
		        	xpath = "/" + indexNode + xpath;
		        	e = e.parentNode;;
		        }else{
		        	return false;
		        }
		    }
		    if (xpath.substring(0, 2) != "//") { xpath = "/html" + xpath; }
		    return xpath;
		}
		
		/*
		* 功能：父节点的相对路径+绝对路径
		*/
		function getXpathByParent(e){
			
			var xpath = "";
			var size = 0;

		    while (e.nodeName.toLowerCase() != "html") {

				var node = e.nodeName;
		        node = node.toLowerCase();
		        var tempXpath = getXpathByText(e);

		        if(getAttributeValue(e,"id")!=-1){
		        	xpath = "//" + node + "[@id='" + e.id + "']" + xpath;

		        }else if(getAttributeValue(e,"name")!=-1){
					xpath = "//" + node + "[@name='" + e.name + "']" + xpath;

		        }else if(tempXpath!=null && isUnique(tempXpath)==1){
		        	xpath = tempXpath + xpath;

		        }else if(getAttributeValue(e,"title")!=-1){
					xpath = "//" + node + "[@title='" + getAttributeValue(e,"title") + "']" + xpath;

				}else{
		        	var indexNode = getIndexOfElement(e);
		        	if( indexNode != null ){
		        		xpath = "/" + indexNode + xpath;
		        	}else{
		        		return false;
		        	}
		    	}

		    	if(isUnique(xpath)==1)
		    	{
		    		break;
		    	}

		    	size++;
		   		e = e.parentNode;
		    }
		    if (xpath.substring(0, 2) != "//") { 
				xpath = "/html" + xpath; 
			}
			return xpath;
		}

		function getXpathByChlid(e){

			var xpath = "";
		    
		    if (e.childElementCount>0) {

				var node = e.nodeName.toLowerCase();
		        xpath = "/parent::" + node;

				var children = e.children;
				var i = 0;

		        while(i<children.length) {

		        	node = children[i].nodeName.toLowerCase();

		            if(getAttributeValue(children[i],"id")!=-1){
		        		xpath = "//" + node + "[@id='" + getAttributeValue(children[i],"id") + "']" + xpath;
		        		return xpath;
		        	}
		        	if(getAttributeValue(children[i],"name")!=-1){
						xpath = "//" + node + "[@name='" + getAttributeValue(children[i],"id") + "']" + xpath;
						return xpath;
		        	}
					var tempXpath = getXpathByText(children[i]);
					if(tempXpath!=null && isUnique(tempXpath)==1){
						xpath = tempXpath + xpath;
						return xpath;
					}
		        	if(getAttributeValue(children[i],"title")!=-1){
		        		xpath = "//" + node + "[@title='" + getAttributeValue(children[i],"title") + "']" + xpath;
		        		return xpath;
		        	}

		        	i++;
		    	}
		    }

			return null;
		}


		function getXpathByBrother(e){

			var parent = e.parentNode;
		    var children = $(parent).children();
		    
		    if (children.size() > 2) {
				
				var xpath = "";
				var flag = false;

		        children.each(function(i) {

		            if (this != e) {

		                childNode = children[i].nodeName.toLowerCase();

		            	if(getAttributeValue(this,"id")!=-1){
		        			xpath = "//" + childNode + "[@id='" + this.id + "']" + xpath;
		        			flag = true;
		        			return false;
		        		}
		        		if(getAttributeValue(this,"name")!=-1){
							xpath = "//" + childNode + "[@name='" + this.name + "']" + xpath;
							flag = true;
							return false;
		        		}
						var tempXpath = getXpathByText(e);
						if(tempXpath!=null&& isUnique(tempXpath)==1){
							xpath = tempXpath + xpath;
							flag = true;
							return false;
						}
		        		if(getAttributeValue(this,"title")!=-1){
		        			xpath = "//" + childNode + "[@title='" + getAttributeValue(this,"title") + "']" + xpath;
		        			flag = true;
		        			return false;
		        		}

		            }
		        });

		      	if (flag) {
		      		var node = getIndexOfElement(e);
		      		var parentNode = parent.nodeName.toLowerCase();
		      		xpath = xpath + "/parent::" + parentNode + "/" + node;
		      		return xpath;
		      	}
		    }
			return null;
		}


		function getXpathByText(e) {

			var text = $(e).contents().filter(function(){ return this.nodeType === 3;}).text();

			text = $.trim(text);

			if(text!=null && text!="" && text!=undefined){
				var nodeName = e.nodeName.toLowerCase();
				var xpath = "";
				var subText;
				var flag = false;

				for (var i = 5; i <= 50; i = i+5){
					subText = text.substring(0,i);
					subText = subText.replace(/\"/g,"");
					subText = subText.replace(/(^s*)|(s*$)/g,"");
					xpath = "//" + nodeName + "[contains(text(),'" + subText + "')]"
					if (isUnique(xpath)==1) {
						flag = true;
						break;
					}
				}
				return xpath;

			}else{
				return null;
			}
		}

		function getXpathByAttr(filter,attrs,xpathArray,nodeName){
			var temp;
			for(var j=0; j<attrs.length; j++){
				if(filter.indexOf(attrs[j].name)!=-1 && attrs[j].value!=null){
					temp ="//" + nodeName + "[contains(@" + attrs[j].name + ",'" + attrs[j].value + "')]";
					xpathArray.push(temp);
				}
			}
		}

		function getAttributeValue(e,attrName){
		 	var attrs = e.attributes;
		 	var filter = new Array();
		 	filter.push(attrName);
			for(var i=0; i<attrs.length; i++){
				if(filter.indexOf(attrs[i].name)!=-1 && attrs[i].value!==null && attrs[i].value!=="" && attrs[i].value!==undefined){
					return attrs[i].value;
				}
			}
			return -1;
		}

		function sort(xpathArray){
			var temp1 = new Array();
			var temp2 = new Array();
			var temp;
			for (x in xpathArray) {
				temp = xpathArray[x];
				if(isUnique(temp)==1){
					temp1.push(temp);
				}else{
					temp2.push(temp);
				}
			};

			temp1 = temp1.concat(temp2);

			return temp1;
		}

		/*
		 *result：2不唯一，1唯一，0不存在
		 */
        function isUnique(xpath){
            var unique;
            var elements;

            try {
                if (frameName!="") {
                    elements = document.evaluate(xpath,frames[frameName].document || frames[frameName].contentDocument,null,XPathResult.ANY_TYPE,null);
                }else{
                    elements = document.evaluate(xpath,document,null,XPathResult.ANY_TYPE,null);
                }
            } catch (err) {
                return 0;
            }

            var i = 0;
            while(elements.iterateNext()!=null){
                if(i>1){
                    return 2;
                }else{
                    i++;
                }
            }
            return i;
        }


		//获取该标签在当层相同标签中的序列
		//return: span[3]
		function getIndexOfElement(e){

			var node = e.nodeName.toLowerCase();
			var parent = e.parentNode;
		    var children = $(parent).children(node);

		    if (children.size() > 1) {

				var good = false;
		    	children.each(function(i) {
		    		if (this == e) {
		    			node = node + "[" + (i+1) + "]";
		    			good = true;
		        		return false;
		         	}
		        });
		        if(!good){
		        	console.log("Can't find child, something is wrong with your dom : " + node);
		        	return null;
		        }
		    }
		    return node;
		}



	};
	
	selector.addLibs();
}

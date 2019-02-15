(function(w){
	var tools = {
		// 对象合并
		extend: function(o,n){
			for (var p in n){
				o[p]=n[p];
			}
		},
		// 添加类
		addClass: function(node,className){
			var reg=new RegExp("\\b"+className+"\\b");
			if(!reg.test(node.className)){
				node.className +=(" "+className); 
			}
		},
		//删除类
		removeClass: function(node,className){
			if(node.className){
				var reg=new RegExp("\\b"+className+"\\b");
				var classes = node.className;
				node.className=classes.replace(reg,"");
				if(/^\s*$/g.test(node.className)){
					node.removeAttribute("class");
				}
			}else{
				node.removeAttribute("class");
			}
		},
		// 字符串转换为Dom
		parseDom: function(str) {
		　　 var objE = document.createElement("div");
		　　 objE.innerHTML = str;
		　　 return objE.childNodes[0];
		},
		// 获取第n个元素
		nth: function(parent,ele,num){
			var _ele=Array.prototype.slice.call(parent.childNodes),eleArray=[];
			//将父节点的子节点转换成数组_ele;eleArray为只储存元素节点的数组
			for(var i= 0,len=_ele.length;i<len;i++){
				if(_ele[i].nodeType==1){
					eleArray.push(_ele[i]);//过滤掉非元素节点
				}
			}
			if(arguments.length===2){
				//如果只传入2个参数，则如果第二个参数是数字，则选取父节点下的第几个元素
				//如果第二个参数是字符串，则选取父节点下的所有参数代表的节点
				if(typeof arguments[1]==="string"){
					_ele=Array.prototype.slice.call(parent.getElementsByTagName(arguments[1]));
					return _ele;
				}else if(typeof arguments[1]==="number"){
					return eleArray[arguments[1]];
				}
			}else{
				//如果参数齐全，则返回第几个某节点,索引从0开始
				_ele=Array.prototype.slice.call(parent.getElementsByTagName(ele));
				return _ele[num];
			}
		},
		replaceChildNodes: function(element, lists){
			var fragment = document.createDocumentFragment();
			for(var i in lists){
				fragment.appendChild(lists[i]);
			}
			element.innerHTML = "";
			element.appendChild(fragment);
		},
		// 生成随机数
		rndNum: function(n){
			var rnd="";
			for(var i=0;i<n;i++)
				rnd+=Math.floor(Math.random()*10);
			return rnd;
		},
		/*t:当前是哪一次
		b:初始位置
		c:最终位置与初始位置之间的差值
		d:总次数
		s:回弹距离
		*/
		Tween: {
			Linear: function(t,b,c,d){ return c*t/d + b; },
			Back: function(t,b,c,d,s){ if (s == undefined) s = 1.70158; return c*(t/=d)*t*((s+1)*t - s) + b; }
		},
		// css2D的读写
		css2D: function(node,type,val){
			if(typeof node ==="object" && typeof node["transform"] ==="undefined" ){
				node["transform"]={};
			}
			if(arguments.length>=3){
				//设置
				var text ="";
				node["transform"][type] = val;
				
				for( item in node["transform"]){
					if(node["transform"].hasOwnProperty(item)){
						switch (item){
							case "translateX":
							case "translateY":
							case "translateZ":
								text +=  item+"("+node["transform"][item]+"px)";
								break;
							case "scale":
								text +=  item+"("+node["transform"][item]+")";
								break;
							case "rotate":
								text +=  item+"("+node["transform"][item]+"deg)";
								break;
						}
					}
				}
				node.style.transform = node.style.webkitTransform = text;
			}else if(arguments.length==2){
				//读取
				val =node["transform"][type];
				if(typeof val === "undefined"){
					switch (type){
						case "translateX":
						case "translateY":
						case "rotate":
							val =0;
							break;
						case "scale":
							val =1;
							break;
					}
				}
				return val;
			}
		},
		// 添加遮罩层
		addMask: function(){
			document.querySelector(".page").appendChild(this.parseDom('<div class="mask"></div>'));
		},
		// 删除遮罩层
		removeMak: function(){
			var mask = document.querySelector(".mask");
			if(mask) document.querySelector(".page").removeChild(mask);
		},
		// 根据起始日期和结束日期获取初始化数组
		getDateArr: function(startDate, endDate){
			var startDateArr = startDate.split("-");
			var endDateArr = endDate.split("-");
			var data = [[], [], []];
			for(var i = startDateArr[0]; i <= endDateArr[0]; i++){
				data[0].push(i + "");
			}
			data[1] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
			if(startDateArr[0] == endDateArr[0]){
				for(var i = startDateArr[1]; i <= endDateArr[1]; i++){
					if(i < 10) i = "0" + i;
					data[1].push(i + "")
				}
			}
			var dayStart = 1;
			var d = this.mGetDate(data[0][0], data[1][0]);
			if(startDateArr[0] == endDateArr[0] && startDateArr[1] == endDateArr[1]){
				dayStart = startDateArr[2];
				d = endDateArr[2];
			}
			for(i = dayStart; i <= d; i++){
				if(i < 10) i = "0" + i;
				data[2].push(i + "")
			}
			return data;
		},
		// 获取当月有多少天
		mGetDate: function(year, month){
			var d = new Date(year, month, 0);
			return d.getDate();
		}
	}
	
	var util = {};
	w.util = util;
	
	// 竖向滑屏
	function VerticalMove(elementId, options){
		this.options = {};
		this.options.elementId = elementId;
		this.options.wrap = document.querySelector(elementId); // 滑屏区域
		this.options.moveItem = this.options.wrap.querySelector(".content-block"); // 滑动元素
		this.options.minY = this.options.wrap.clientHeight - this.options.moveItem.offsetHeight; // 元素向左滑动有橡皮筋效果的距离
		this.options.lastTime = 0; // 手指在上一次位置的时间
		this.options.lastPoint = 0; // 手指的上一次位置
		this.options.lastPointX = 0; // 手指的上一次位置在y轴的位置 防抖动
		this.options.timeDis = 1; // 时间差距 防NaN
		this.options.pointDis = 0; // 距离差距
		this.options.isY = true; // 首次滑屏方向 防抖动
		this.options.isFirst = true; // 是否是第一次滑屏 防抖动
		this.options.isMove = false; // 点击触发插件元素的时候是否滑动
		this.options.forbitTopBackRubberBanding = false; // 禁止手动滑屏头部回弹
		this.options.forbitBottomBackRubberBanding = false; // 禁止手动滑屏底部回弹
		this.options.forbitBottomRubberBanding = false; // 禁止手动滑屏底部橡皮筋效果 
		this.options.clearTimer = 0; // 快速滑屏无限循环
		if(typeof options === 'object') tools.extend(this.options, options);
		// 插件初始化
		init(this.options)
		// 滑动事件监听
		addSlideEvet(this.options);
		
		// 插件初始化
		function init(options){
			tools.css2D(options.moveItem, "translateZ" , 0);
		}
	
		// 滑动事件监听
		function addSlideEvet(options){
			options.wrap.addEventListener("touchstart", function(ev){
				ev = ev || event;
				var touchC = ev.changedTouches[0];
				options.minY = options.wrap.clientHeight - options.moveItem.offsetHeight;
				options.moveItem.style.transition = "none";
				options.lastTime = new Date().getTime();
				options.lastPoint = touchC.clientY;
				options.lastPointX = touchC.clientX;
				// 清除速度的残留
				options.pointDis = 0;
				// 防抖动
				options.isY = true;
				options.isFirst = true;
				// 即点即停
				clearInterval(options.clearTimer);
				// touchstart回调
				if(options.startCallback && typeof options.startCallback === "function") options.startCallback(options);
			});
			options.wrap.addEventListener("touchmove", function(ev){
				if(!options.isY) return; // 防抖动
				ev = ev || event;
				var touchC = ev.changedTouches[0];
				var nowTime = new Date().getTime();
				var nowPoint = touchC.clientY;
				var nowPointX = touchC.clientX;
				var pointDisX = nowPointX - options.lastPointX;
				options.timeDis = nowTime - options.lastTime;
				options.pointDis = nowPoint - options.lastPoint;
				options.lastTime = nowTime;
				options.lastPoint = nowPoint;
				if(options.isFirst){
					options.isFirst = false;
					if(Math.abs(pointDisX) > Math.abs(options.pointDis)){
						options.isY = false;
						// 首次防抖动
						return;
					} 
				}
				// 当滑动区域小于滑屏区域时，禁止向下的滑屏
				if(options.pointDis < 0 && options.minY > 0) return;
				var translateY = tools.css2D(options.moveItem, "translateY") + options.pointDis;
				/* 
				手动滑屏橡皮筋效果
				在move的过程中 手指滑动平均距离的元素的滑动距离慢慢变小
				*/
				if(translateY > 0){  // 手动滑动头部橡皮筋效果
					var scale = document.documentElement.clientHeight / ((document.documentElement.clientHeight + translateY) * 2);
					translateY = tools.css2D(options.moveItem, "translateY") + options.pointDis * scale;
					options.moveItem.handleMove = true;
				}else if(translateY < options.minY){ // 手动滑动底部橡皮筋效果
					// 禁止手动滑屏底部橡皮筋效果
					if(options.forbitBottomRubberBanding) return;
					var over = options.minY -translateY;
					var scale = document.documentElement.clientHeight / ((document.documentElement.clientHeight + over) * 2);
					translateY = tools.css2D(options.moveItem, "translateY") + options.pointDis * scale;
					options.moveItem.handleMove = true;
				}
				tools.css2D(options.moveItem, "translateY", translateY);
				// touchmove回调(手动滑屏)
				if(options.moveCallback && typeof options.moveCallback === "function") options.moveCallback(options);
			});
			options.wrap.addEventListener("touchend", function(ev){
				// 当滑动区域小于滑屏区域时，禁止向下的滑屏
				if(options.pointDis < 0 && options.minY > 0) return;
				ev = ev || event;
				// 快速滑屏 速度越大 位移越远
				var speed = Math.abs(options.pointDis / options.timeDis) < 0.5 ? 0 : (options.pointDis / options.timeDis);
				var targetY = tools.css2D(options.moveItem, "translateY") + speed * 200;
				var time = (Math.abs(speed) * 0.2) < 0.6 ? 0.6 : ((Math.abs(speed) * 0.2) > 1 ? 1 : (Math.abs(speed) * 0.2));
				var type = "Linear";
				if(targetY > 0){ // 拉到了头顶
					// 禁止手动滑屏头部回弹
					if(options.forbitTopBackRubberBanding){
						if(options.endCallback && typeof options.endCallback === "function") options.endCallback(options);
						return;
					}
					targetY = 0;
					if(!options.moveItem.handleMove){ // 手动滑动头部回弹橡皮筋效果
						type = "Back";
					}
				}else if(targetY < options.minY){ // 拉到了底部
					// 禁止手动滑屏底部回弹
					if(options.forbitBottomBackRubberBanding){
						if(options.endCallback && typeof options.endCallback === "function") options.endCallback(options);
						return;
					}
					targetY = options.minY;
					if(!options.moveItem.handleMove){ // 手动滑动底部回弹橡皮筋效果
						type = "Back";
					}
				}
				bsr(options, targetY, time, type);
				options.moveItem.handleMove = false;
			 
			});
		}
		
		// 运动轨迹
		function bsr(options,targetY, time, type){
			clearInterval(options.clearTimer);
			var t = 0; // 当前次数
			var b = tools.css2D(options.moveItem, "translateY"); // 初始位置
			var c = targetY - b; // 最终位置-初始位置
			var d = time*1000 / (1000/60); // 总次数
			options.clearTimer = setInterval(function(){
				t++;
				if(t > d){
					clearInterval(options.clearTimer);
					// touchend回调
					if(options.endCallback && typeof options.endCallback === "function") options.endCallback(options);
					return;
				}
				var point = tools.Tween[type](t, b, c, d)
				tools.css2D(options.moveItem, "translateY", point);
				// touchmove回调(快速滑屏)
				if(options.moveCallback && typeof options.moveCallback === "function") options.moveCallback(options);
			}, 1000/60);
		}
	}

	// 销毁实例
	VerticalMove.prototype.destroy = function(){
		delete this;
	}
	w.VerticalMove = VerticalMove;
	
	var pullLayer, pullStartCallback, pullMoveCallback, pullEndCallback;
	// 下拉刷新
	util.pullRefresh = function(callback){
		scrollVerticalMove.options.wrap.insertBefore(tools.parseDom('<div class="pull-refresh-layer"><div class="pull-icon"></div></div>'), scrollVerticalMove.options.moveItem);
		pullLayer = scrollVerticalMove.options.wrap.querySelector(".pull-refresh-layer");
		tools.css2D(pullLayer, "translateY", -pullLayer.offsetHeight);
		var deg;
		var timer
		pullStartCallback = function(options){
			clearInterval(timer)
			timer = null;
			deg = 0;
			pullLayer.querySelector(".pull-icon").style.transform = "rotate(" + deg + "deg)";
		}
		pullMoveCallback = function(options){
			pullLayer.style.transition = "";
			scrollVerticalMove.options.forbitTopBackRubberBanding = false;
			pullEndCallback = null;
			tools.css2D(pullLayer, "translateY", -pullLayer.offsetHeight + tools.css2D(options.moveItem, "translateY"));
			if(tools.css2D(pullLayer, "translateY") >= 0){
				scrollVerticalMove.options.forbitTopBackRubberBanding = true;
				pullEndCallback = callback;
				if(timer) return;
				timer = setInterval(function(){
					deg += 180/(1000/60);
					if(deg >= 180) deg = 180;
					pullLayer.querySelector(".pull-icon").style.transform = "rotate(" + deg + "deg)";
					if(deg == 180){
						clearInterval(timer);
						timer = null;
					}
				}, 1000/60)
			}
		}
	}
	util.pullRefreshDone = function(){
		scrollVerticalMove.options.moveItem.style.transition = "1s transform";
		pullLayer.style.transition = "1s transform";
		tools.css2D(scrollVerticalMove.options.moveItem, "translateY",  0);
		tools.css2D(pullLayer, "translateY", -pullLayer.offsetHeight);
	}
	
	var infiniteLayer, infiniteStartCallback, infiniteMoveCallback, infiniteEndCallback;
	// 无限滚动
	util.infinite = function(callback){
		scrollVerticalMove.options.moveItem.appendChild(tools.parseDom('<div class="infinite-layer" style="display:none"><div class="infinite-icon"></div></div>'));
		infiniteLayer = scrollVerticalMove.options.wrap.querySelector(".infinite-layer");
		scrollVerticalMove.options.forbitBottomRubberBanding = true;
		infiniteMoveCallback = function(options){
			infiniteLayer.style.display = "block";
			scrollVerticalMove.options.minY = scrollVerticalMove.options.wrap.clientHeight - scrollVerticalMove.options.moveItem.offsetHeight;
			infiniteEndCallback = callback;
		}
	}
	util.loadingEnd = function(){
		infiniteLayer.style.display = "none";
		scrollVerticalMove.options.minY = scrollVerticalMove.options.wrap.clientHeight - scrollVerticalMove.options.moveItem.offsetHeight;
		 
	}
	
	var scrollVerticalMove;
	// 全局初始化
	globalInit();
	function globalInit(){
		var pageContainer = document.querySelector(".page-container");
		pageContainer.appendChild(tools.parseDom('<div class="scrollBar"></div>'))
		var content = document.querySelector(".page-container .content-block");
		var bar = document.querySelector(".scrollBar");
		scrollVerticalMove = new VerticalMove(".page-container", {
			startCallback: startCallback,
			moveCallback: moveCallback,
			endCallback: endCallback,
		});
		// 竖向滑屏一开始时触发
		function startCallback(options){
			if(content.offsetHeight <= pageContainer.offsetHeight) return;
			bar.style.height = (pageContainer.offsetHeight / content.offsetHeight) * pageContainer.offsetHeight + "px";
			bar.style.opacity = 1;
			if(tools.css2D(options.moveItem, "translateY") >= 0 && pullStartCallback && typeof pullStartCallback == "function") pullStartCallback(options);
			//if(infiniteStartCallback && typeof infiniteStartCallback == "function") infiniteStartCallback(options);
		}
		// 竖向滑屏滑动中持续触发
		function moveCallback(options){
			// 滚动条滚动的实时距离/滚动条能滚动的最远距离 = 内容滚动的实时距离 / 内容能滚动的最远距离
			var scale = tools.css2D(options.moveItem, "translateY") / (content.offsetHeight - pageContainer.offsetHeight);
			tools.css2D(bar, "translateY", -scale*(pageContainer.offsetHeight-bar.offsetHeight));
			if(tools.css2D(options.moveItem, "translateY") >= 0 && pullMoveCallback && typeof pullMoveCallback == "function") pullMoveCallback(options);
			if(Math.ceil(tools.css2D(options.moveItem, "translateY")) <= options.minY + 50){
				if(infiniteMoveCallback && typeof infiniteMoveCallback == "function") infiniteMoveCallback(options);
			}
		}
		// 竖向滑屏结束时触发
		function endCallback(options){
			bar.style.opacity = 0;
			if(tools.css2D(options.moveItem, "translateY") >= 0 && pullEndCallback && typeof pullEndCallback == "function") pullEndCallback(options);
			if(Math.ceil(tools.css2D(options.moveItem, "translateY")) <= options.minY + 50){
				if(infiniteEndCallback && typeof infiniteEndCallback == "function") infiniteEndCallback(options);
			}
		}
	}
	w.globalInit = globalInit;
	
})(window)
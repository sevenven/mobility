!(function(w){
	function SlideNav(elementId, callback){
		this.options = {};
		this.options.elementId = elementId; // 组件id
		this.options.tapWrap = document.querySelector(elementId + " .tap-wrap"); //滑动元素
		this.options.contentNode = document.querySelector(elementId + " .tap-content"); // 滑屏区域
		this.options.ulList = document.querySelector(elementId + " .nav-list"); // 列表区域
		this.options.width = this.options.contentNode.getBoundingClientRect().width.toFixed(1); // 滑屏区域的宽
		this.options.startPoint = { x: 0, y: 0 }; // 手指一开始的位置
		this.options.elementPoint = { x: 0, y: 0 };// 元素一开始的位置
		this.options.isX = true; // 防抖动
		this.options.isFirst = true; // 防抖动
		this.options.isOver = false; // 防止多次junmp
		this.options.callback = callback; // 回调函数
		this.options.transitionendHandle; // transitionend回调函数
		this.options.isMove = false; // 点击导航是否滑动
		this.options.isDone = true; // 请求是否执行完毕
		// 初始化
		init(this.options);
		// 点击导航监听
		ulListClickEvent(this.options);
		// 滑动事件监听
		addSlideEvet(this.options);
	}
	// 销毁实例
	SlideNav.prototype.destroy = function(){
		delete this;
	}
	// 回到初始化的位置
	SlideNav.prototype.pullToRefreshDone = function(){
		init(this.options);
		this.options.isDone = true;
	}
	// 初始化
	function init(options){
		css2D(options.tapWrap, "translateX", -options.width);
		loadingshow(options, false);
	}
	// 点击导航监听
	function ulListClickEvent(options){
		options.ulList.addEventListener("touchstart", function(ev){
			ev = ev || event;
			options.isMove = false;
		});
		options.ulList.addEventListener("touchmove", function(ev){
			ev = ev || event;
			options.isMove = true;
		});
		options.ulList.addEventListener("touchend", function(ev){
			if(options.isMove) return;
			if(!options.isDone) return;
			ev = ev || event;
			var liItems = document.querySelectorAll(options.elementId + " .nav-list li");
			var index = [].indexOf.call(ev.target.parentElement.children, ev.target);
			var liActive = document.querySelector(options.elementId + " .nav-list li.active");
			var activeIndex = [].indexOf.call(liActive.parentElement.children, liActive);
			removeClass(liActive, "active")
			addClass(liItems[index], "active");
			options.tapWrap.style.transition = "1.5s transform";
			index < activeIndex ? css2D(options.tapWrap, "translateX", 0) : css2D(options.tapWrap, "translateX", -options.width * 2);
			// loading显示与隐藏
			loadingshow(options, true);
			// 监听动画执行完毕
			transitionendEvent(options);
			options.isDone = false;
		});
	}
	// 滑动事件监听
	function addSlideEvet(options){
		options.contentNode.addEventListener("touchstart", function(ev){
			ev = ev || event;
			var touchC = ev.changedTouches[0];
			options.startPoint.x = touchC.clientX;
			options.startPoint.y = touchC.clientY;
			options.elementPoint.x = css2D(options.tapWrap, "translateX");
			options.isX = true;
			options.isFirst = true;
			options.isOver = false;
			options.tapWrap.style.transition = "";
		});
		options.contentNode.addEventListener("touchmove", function(ev){
			if(!options.isX) return; // 防抖动
			if(options.isOver) return;
			ev = ev || event;
			var touchC = ev.changedTouches[0];
			var nowPoint = { x: 0, y: 0 };
			nowPoint.x = touchC.clientX;
			nowPoint.y = touchC.clientY;
			var dis = { x: 0, y: 0 };;
			dis.x = nowPoint.x - options.startPoint.x;
			dis.y = nowPoint.y - options.startPoint.y;
			if(options.isFirst){
				options.isFirst = false;
				if(Math.abs(dis.x) < Math.abs(dis.y)){
					options.isX = false;
					return; //首次防抖动
				}
			}
			css2D(options.tapWrap, "translateX", options.elementPoint.x + dis.x);
			// 1/2跳转
			jump(options, dis.x);
		});
		options.contentNode.addEventListener("touchend", function(ev){
			ev = ev || event;
			var touchC = ev.changedTouches[0];
			var nowPointX = touchC.clientX;
			var disX = nowPointX - options.startPoint.x;
			if(Math.abs(disX) <= options.width / 2){
				options.tapWrap.style.transition = "1s transform"
				css2D(options.tapWrap, "translateX", -options.width);
			}
		});
	}

	// 1/2跳转
	function jump(options, disX){
		if(Math.abs(disX) > options.width / 2){
			options.isOver = true;
			options.tapWrap.style.transition = "1s transform";
			disX > 0 ? css2D(options.tapWrap, "translateX", 0) : css2D(options.tapWrap, "translateX", -options.width * 2);
			// loading显示与隐藏
			loadingshow(options, true);
			// 改变当前的li项
			liChange(options, disX)
			// 监听动画执行完毕
			transitionendEvent(options)
		}
	}

	// 改变当前的li项
	function liChange(options, disX){
		var liItems = document.querySelectorAll(options.elementId + " .nav-list li");
		var liActive = document.querySelector(options.elementId + " .nav-list li.active");
		var index = [].indexOf.call(liActive.parentElement.children, liActive);
		if(disX < 0){
			if(index != liItems.length - 1){
				index ++;
			}else{
				index = 0;
			}
		}else{
			if(index != 0){
				index--;
			}else{
				index = liItems.length - 1;
			}
		}
		removeClass(liActive, "active");
		addClass(liItems[index], "active");
	}

	// 监听动画执行完毕
	function transitionendEvent(options){
		// 动画执行完毕之后请求
		options.transitionendHandle = transitionendHandle(options);
		options.tapWrap.addEventListener("transitionend", options.transitionendHandle);
		options.tapWrap.addEventListener("webkitTransitionEnd", options.transitionendHandle);
	}

	// 动画执行完毕事件回调函数
	function transitionendHandle(options){
		return function(){
			options.tapWrap.removeEventListener("transitionend", options.transitionendHandle);
			options.tapWrap.addEventListener("webkitTransitionEnd", options.transitionendHandle);
			options.tapWrap.style.transition = "";
			options.callback(document.querySelector(options.elementId + " .nav-list li.active").getAttribute("data-value"));
		}
	}

	// loading层的显示与隐藏
	function loadingshow(options, isShow){
		loadings = document.querySelectorAll(options.elementId + " .tap-loading");
		for(var i = 0; i < loadings.length; i++){
			if(isShow){
				loadings[i].style.opacity = 1;
			}else{
				loadings[i].style.opacity = 0;
			}
		}
	}

	// css2D的读写
	function css2D(node,type,val){
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
	}

	// 添加类
	function addClass(node,className){
		var reg=new RegExp("\\b"+className+"\\b");
		if(!reg.test(node.className)){
			node.className +=(" "+className); 
		}
	}
	//删除类
	function removeClass(node,className){
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
	}
	w.SlideNav = SlideNav;
})(window)

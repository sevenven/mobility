!(function(w){
	function Drag(elementId){
		this.options = {};
		this.options.elementId = elementId;
		this.options.wrap = document.querySelector(elementId + ".nav-wrap"); // 滑屏区域
		this.options.ulNode = document.querySelector(elementId + ".nav-wrap .nav-list"); // 滑动元素
		this.options.minX = this.options.wrap.clientWidth - this.options.ulNode.offsetWidth; // 元素向左滑动有橡皮筋效果的距离
		this.options.lastTime = 0; // 手指在上一次位置的时间
		this.options.lastPoint = 0; // 手指的上一次位置
		this.options.lastPointY = 0; // 手指的上一次位置在y轴的位置 防抖动
		this.options.timeDis = 1; // 时间差距 防NaN
		this.options.pointDis = 0; // 距离差距
		this.options.isX = true; // 首次滑屏方向 防抖动
		this.options.isFirst = true; // 是否是第一次滑屏 防抖动
		this.options.isMove = false; // 是否滑动
		// 滑动事件监听
		addSlideEvet(this.options);
		// 导航点击监听
		addTapEvet(this.options);
	}
	// 销毁实例
	Drag.prototype.destroy = function(){
		delete this;
	}
	// 滑动事件监听
	function addSlideEvet(options){
		options.wrap.addEventListener("touchstart", function(ev){
			ev = ev || event;
			var touchC = ev.changedTouches[0];
			options.ulNode.style.transition = "none";
			options.lastTime = new Date().getTime();
			options.lastPoint = touchC.clientX;
			options.lastPointY = touchC.clientY;
			// 清除速度的残留
			options.pointDis = 0;
			// 防抖动
			options.isX = true;
			options.isFirst = true;
		});
		options.wrap.addEventListener("touchmove", function(ev){
			if(!options.isX) return; // 防抖动
			ev = ev || event;
			var touchC = ev.changedTouches[0];
			var nowTime = new Date().getTime();
			var nowPoint = touchC.clientX;
			var nowPointY = touchC.clientY;
			var pointDisY = nowPointY - options.lastPointY;
			options.timeDis = nowTime - options.lastTime;
			options.pointDis = nowPoint - options.lastPoint;
			options.lastTime = nowTime;
			options.lastPoint = nowPoint;
			if(options.isFirst){
				options.isFirst = false;
				if(Math.abs(pointDisY) > Math.abs(options.pointDis)){
					options.isX = false;
					// 首次防抖动
					return;
				} 
			}
			var translateX = css2D(options.ulNode, "translateX") + options.pointDis;
			/* 
			橡皮筋效果
			在move的过程中 手指滑动平均距离的元素的滑动距离慢慢变小
			*/
			if(translateX > 0){
				var scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + translateX) * 2);
				translateX = css2D(options.ulNode, "translateX") + options.pointDis * scale;
				options.ulNode.handleMove = true;
			}else if(translateX < options.minX){
				var over = options.minX -translateX;
				var scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + over) * 2);
				translateX = css2D(options.ulNode, "translateX") + options.pointDis * scale;
				options.ulNode.handleMove = true;
			}
			css2D(options.ulNode, "translateX", translateX);
		});
		options.wrap.addEventListener("touchend", function(ev){
			ev = ev || event;
			// 速度越大 位移越远
			var speed = Math.abs(options.pointDis / options.timeDis) < 0.5 ? 0 : (options.pointDis / options.timeDis);
			var targetX = css2D(options.ulNode, "translateX") + speed * 200;
			var bsr = "";
			var time = (Math.abs(speed) * 0.2) < 0.8 ? 0.8 : ((Math.abs(speed) * 0.2) > 1.5 ? 1.5 : (Math.abs(speed) * 0.2));
			if(targetX > 0){
				targetX = 0;
				// 处理橡皮筋效果的冲突
				if(!options.ulNode.handleMove){
					bsr = "cubic-bezier(.25,1.71,.73,1.6)";
				}
			}else if(targetX < options.minX){
				targetX = options.minX;
				if(!options.ulNode.handleMove){
					bsr = "cubic-bezier(.25,1.71,.73,1.6)";
				}
			}
			options.ulNode.style.transition = time + "s " + bsr + " transform";
			css2D(options.ulNode, "translateX", targetX);
			options.ulNode.handleMove = false;
		});
	}
	// 导航点击监听
	function addTapEvet(options){
		options.ulNode.addEventListener("touchstart", function(){
			options.isMove = false;
		});
		options.ulNode.addEventListener("touchmove", function(){
			options.isMove = true;
		});
		options.ulNode.addEventListener("touchend", function(ev){
			ev = ev || event;
			if(options.isMove) return;
			var touchC = ev.changedTouches[0];
			removeClass(document.querySelector(options.elementId + " ul li.active"), "active");
			if(touchC.target.nodeName.toUpperCase() === "A"){
				addClass(touchC.target.parentNode, "active")
			}
			if(touchC.target.nodeName.toUpperCase() === "LI"){
				addClass(touchC.target, "active")
			}
		});
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
	w.Drag = Drag;
})(window)
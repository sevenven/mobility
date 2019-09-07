!(function(w){
	var Swiper = function(elementId, imgArr){
		this.options = {};
		this.options.elementId = elementId; // 组件ID
		this.options.carouselWrap = document.querySelector(elementId); // 元素
		this.options.needSeamless = this.options.carouselWrap.getAttribute("needSeamless") === null ? false : true; // 无缝轮播
		this.options.needAuto = this.options.carouselWrap.getAttribute("needAuto") === null ? false : true; // 自动轮播
		this.options.ulNode = null; // 图片容器
		this.options.pointsWrap = document.querySelector(elementId + " .carousel-points"); // 分页器容器
		this.options.points = null; // 分页器
		this.options.pointsLength = imgArr.length; // 分页器数量
		this.options.imgArr =  this.options.needSeamless ? imgArr.concat(imgArr) : imgArr; // 初始化图片
		this.options.imgLength = this.options.imgArr.length; // 图片初始化数量
		this.options.timer = 0; // 定时器
		this.options.index = 0; // 当前图片下标
		this.options.elementX = 0 // touchstart时元素的位置
		this.options.startX = 0; // touchstart时手指的位置
		this.options.startY = 0; // touchstart时手指在y轴的位置 防抖动
		this.options.isX = true; // 首次滑屏方向 防抖动
		this.options.isFirst = true; // 是否是第一次滑屏 防抖动
		// 组件初始化
		init(this.options);
		// 添加滑屏监听
		addSlideEven(this.options);
	}
	Swiper.prototype.destroy = function(){
		delete this;
	}
	
	// 组件初始化
	function init(options) {
		if(options.carouselWrap){
			options.ulNode = document.createElement("ul");
			options.ulNode.classList.add("carousel-list");
			options.ulNode.style.width = options.imgLength + "00%";
			for(var i = 0; i < options.imgLength; i++){
				options.ulNode.innerHTML += '<li style="width: ' + (100/options.imgLength) + '%"><a href="javascript:;"><img src="' + options.imgArr[i] + '" /></a></li>';
			}
			options.carouselWrap.appendChild(options.ulNode);
			var imgNode = document.querySelector(options.elementId + " .carousel-list > li > a > img");
			imgNode.onload = function () {
				options.carouselWrap.style.height = imgNode.offsetHeight + "px";
			}
			if(options.pointsWrap){   
				for(var i = 0; i < options.pointsLength; i++){
					if(i == 0){
						options.pointsWrap.innerHTML += '<span class="active"></span>'
					}else{
						options.pointsWrap.innerHTML += '<span></span>'
					}
				}
				options.points = document.querySelectorAll(options.elementId + " .carousel-points > span")
			}
			if(options.needAuto){
				auto(options)
			}
		}
	}
	
	// 添加滑屏监听
	function addSlideEven(options){
		/* 
			滑屏
			1.拿到元素一开始的位置
			2.拿到手指一开始点击的位置
			3.拿到手指move的实时距离
			4.将手指移动的距离加给元素
		*/
		options.carouselWrap.addEventListener("touchstart", function(ev){
			ev=ev||event;
			var touchC = ev.changedTouches[0];
			// 无缝
			// 点击第一组的第一张时 瞬间跳到第二组的第一张
			// 点击第二组的最后一张时 瞬间跳到第一组的最后一张
			if(options.needSeamless){
				var index = Math.round(css2D(options.ulNode, "translateX") / document.querySelector(options.elementId + " .carousel-list > li").getBoundingClientRect().width.toFixed(1));
				if(index === 0){
					index = -options.pointsLength;
				}
				if(-index == (options.imgLength-1)){
					index = -(options.pointsLength - 1);
				}
				css2D(options.ulNode, "translateX", index * (document.querySelector(options.elementId + " .carousel-list > li").getBoundingClientRect().width.toFixed(1)));
			}
			if(options.needAuto){
				clearInterval(options.timer)
			}
			options.ulNode.style.transition = "none"
			options.startX = touchC.clientX;
			options.elementX = css2D(options.ulNode, "translateX");
			options.startY = touchC.clientY;
			options.isX = true;
			options.isFirst = true;
		});
		options.carouselWrap.addEventListener("touchmove", function(ev){
			if(!options.isX) return; // 防抖动
			ev=ev||event;
			var touchC = ev.changedTouches[0];
			var nowX = touchC.clientX;
			var nowY = touchC.clientY;
			var disX = nowX - options.startX;
			var disY = nowY - options.startY;
			if(options.isFirst){
				options.isFirst = false;
				if(Math.abs(disY) > Math.abs(disX)){
					options.isX = false;
					// 首次防抖动
					return;
				} 
			}
			css2D(options.ulNode, "translateX", options.elementX + disX)
		});
		options.carouselWrap.addEventListener("touchend", function(ev){
			ev = ev || event;
			options.index = Math.round(css2D(options.ulNode, "translateX") / document.querySelector(options.elementId + " .carousel-list > li").getBoundingClientRect().width.toFixed(1));
			// 超出控制
			if(options.index > 0){
				options.index = 0;
			}else if(options.index < 1 - options.imgLength){
				options.index = 1 - options.imgLength;
			}
			circleFlag(options);
			options.ulNode.style.transition = "0.5s transform";
			css2D(options.ulNode, "translateX", options.index * (document.querySelector(options.elementId + " .carousel-list > li").getBoundingClientRect().width.toFixed(1)));
			if(options.needAuto){
				auto(options);
			} 
		});
	}
	
	// 自动轮播
	function auto(options){
		clearInterval(options.timer);
		options.timer = setInterval(function(){
			// 无缝
			// 当前是第一组的第一张时 瞬间跳到第二组的第一张
			// 当前是第二组的最后一张时 瞬间跳到第一组的最后一张
			if(options.needSeamless){
				if(options.index == (1 - options.imgLength)){
					options.index = 1 - options.pointsLength;
					options.ulNode.style.transition = "none";
					css2D(options.ulNode, "translateX", options.index * (document.querySelector(options.elementId + " .carousel-list > li").getBoundingClientRect().width.toFixed(1)));
				}
			}else{
				if(options.index == 1 - options.imgLength){
					options.index = 0;
					options.ulNode.style.transition = "none";
					css2D(options.ulNode, "translateX", options.index * (document.querySelector(options.elementId + " .carousel-list > li").getBoundingClientRect().width.toFixed(1)));
					options.index++;
				}
			}
			options.index--;
			setTimeout(function(){
				options.ulNode.style.transition = "0.5s transform";
				circleFlag(options);
				css2D(options.ulNode, "translateX", options.index * (document.querySelector(options.elementId + " .carousel-list > li").getBoundingClientRect().width.toFixed(1))); 
			}, 50) 
		}, 2000)
	}
	
	// 分页器改变	
	function circleFlag(options){
		if(!options.pointsWrap) return;
		for(var i = 0; i < options.pointsLength; i++){
			options.points[i].classList.remove("active");
		}
		options.points[-options.index%options.pointsLength].classList.add("active");
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
	w.Swiper = Swiper;
})(window)
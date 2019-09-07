/*
	原理：改变了一个元素在不同设备上占据的css像素的个数
	rem适配的优缺点
		优点:没有破坏完美视口
		缺点:px值到rem的转换太复杂
*/
!(function(){
	var styleNode = document.createElement("style");
	var w = document.documentElement.clientWidth/7.5; // 100*(document.documentElement.clientWidth/750) ??
	styleNode.innerHTML = "html{font-size:"+w+"px!important}";
	document.head.appendChild(styleNode);
})();
//重置html字体大小
window.onload = window.onresize = function resetFont() {
    //兼容ie浏览器写法
    var wWidth = document.documentElement.clientWidth || document.body.clientWidth
    var font_size = wWidth / 320 * 10
    document.querySelector('html').style.fontSize = font_size + 'px'
    // console.log(font_size)
}
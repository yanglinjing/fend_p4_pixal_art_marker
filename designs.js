// -------表格部分---------
let height, width;
//定义初始值
//height = $('#input_height').val();//行
//width = $('#input_width').val();//列
height=1;
width=1;

//输入值变化时
$('#input_height').change(function(){
  height = $(this).val();//行
});
$('#input_width').change(function(){
  width = $(this).val();//列
});

// When size is submitted by the user, call makeGrid()
let form, table;
form = $("#sizePicker");
table = $('#pixel_canvas');

form.submit(function makeGrid(){
//清除现有的height和width
    table.find('*').remove();//.find(selector)selector是必填的
//确认表格尺寸对话框
//    alert("Make a " + height + " x " + width + " picture?");
//画表格
    for (let row=0; row<height; row++){//小于而不是小于等于
        table.append("<tr></tr>");
    }
    for(let column=0; column<width; column++){
        table.children('tr').append("<td style=\"background-color:\"></td>");
    }
    event.preventDefault();//防止一提交就归零
});


//---------调色盘部分-----------
let color;

let inkColor = [];
function inkBoxArray(newColor){//数组保存最多5个用过颜色值
    inkColor.unshift(newColor);//把颜色值添加到数组第一个位置
    if(inkColor.length=6){
      inkColor.pop();//保持始终只有5个颜色值
    }
}

function inkBoxColor(){//在小方格里画出保存的颜色值
    $('#inkBox1').css("background-color", inkColor[0]);
    $('#inkBox2').css("background-color", inkColor[1]);
    $('#inkBox3').css("background-color", inkColor[2]);
    $('#inkBox4').css("background-color", inkColor[3]);
    $('#inkBox5').css("background-color", inkColor[4]);
    $('#curColorBox').css("background-color", inkColor[0]);
    $('#CurColorText').text(inkColor[0]);
    $('#CurColorText').css("color", color);
}

$('#colorPicker').change(function(){//点击拾色器，选择当前颜色
    color = $(this).val();//更改颜色值
    inkBoxArray(color);
    inkBoxColor();
});

//-------------<选择历史颜色>-----------
function unique(array){//点击“历史颜色”时候，从数组中删去当前位置的color，这样“历史颜色”里就不会出现重复的颜色
  for(const i in array){//遍历当前数组:因为index是可枚举属性，所以要用for in而不是for of
    if(array[i]===color){
        array.splice(i, 1);
    }
  }
  return array;
}

$('#inkBox').on('click', 'td', function(){//点击已保存的值时，替换当前颜色值
    let inkRgb;
    inkRgb = $(this).css("background-color");
    if(inkRgb != "rgba(0, 0, 0, 0)"){//小方格初始为透明色，不加这句话的话，总是在rgb2hex函数那报错
      color = rgb2hex(inkRgb);
    }
    unique(inkColor);//从数组中删去当前位置的color
    inkBoxArray(color);//把color添加到数组第一个位置
    inkBoxColor();
});

//-------------<手写颜色代码>-----------
$('#typeColor').click(function(){
    $(this).select();
});

$('#typeColor').on('change', function(){
    let yourColor;
    yourColor = $('#typeColor').val();
    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(yourColor)){
      color = yourColor;
      inkBoxArray(color);
      inkBoxColor();
      $('#notice').text("");
    }else{
      $('#notice').text("Color should be in hex format!")
    }
});

//-------------<橡皮>-----------
let eraserInUse = false;
$('#eraser').click(function(){
  if($(this).is(':checked')){
    eraserInUse = true;
    $('#pixel_canvas').css("cursor", "url(images/eraser.ico), auto");
  }else{
    eraserInUse = false;
    $('#pixel_canvas').css("cursor", "url(images/pencil.ico), auto");
  }
});

//---------绘图部分-----------
//---------<点击绘图>-----------
let clicked = false;//曾点击过

table.on('click', 'td', function(){//点击变色
  if(!eraserInUse){//非橡皮擦状态下
      $(this).css({"background-color":color, "border-color":color});
  }else{//橡皮擦状态下
      $(this).css({"background-color":"#f1f1f1", "border-color":"#fff"});
  }
  clicked = true;
});

//---------<按住左键拖拽绘图>及<鼠标悬停变色>-------
let clicking = false;//按住鼠标左键
table.on('mousedown', 'td', function(){
  clicking = true;
});
$(document).on('mouseup', function(){//放开鼠标左键
  clicking = false;
});

$(document).on('contextmenu', function(){ //防止右键点击时候，也会画出颜色
  clicking = false;
});

let rgbBg, rgbBorder;
table.on('mouseenter', 'td', function(){
    rgbBg = $(this).css("background-color");//获取td的背景颜色
    rgbBorder = $(this).css("border-color");//获取td的边框颜色
    if(!eraserInUse){//非橡皮擦状态下
        $(this).css({"background-color":color, "border-color":color});
    }else{//橡皮擦状态下
        $(this).css({"background-color":"#f1f1f1", "border-color":"#fff"});
    }
    if(clicking){//按下鼠标+滑动=变色
        clicked = true;
    }
});

table.on('mouseleave', 'td', function(){//mousemove和mouseenter/mouseleave有冲突，会彼此覆盖
    if(!clicked){//鼠标离开时，格子恢复之前颜色
      $(this).css({"background-color":rgbBg, "border-color":rgbBorder});
    }
    clicked = false;
});

//-----------rgb转换hex：颜色转换代码参考互联网-------------
//-----（因为jQuery提取的颜色格式rgb hex rgba各不相同）-----
function rgb2hex(rgb) {
    let preColor;
    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(rgb)){
      preColor=rgb;
      return preColor;
    }else{
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      function hex(x) {return ("0" + parseInt(x).toString(16)).slice(-2);}
      preColor = "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
      return preColor;
    }
}
//-----------rgb转换hex-----end---------------

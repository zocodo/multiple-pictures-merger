/**
 * Created by zhangchao on 17/3/6.
 */
(function() {
  var cArea = $('#editImgEle');  // 最外层容器
  var drag = $('.drag');  // 拖拽区域
  var cAreaH = cArea.height(); //容器高度
  var cAreaW = cArea.width();  // 容器宽度
  var cAreaTop = getPosition(cArea).Y; // 容器距离浏览器上边界距离
  var cAreaLeft = getPosition(cArea).X; // 容器距离浏览器左边界距离
  var currentEle = null; // 缓存当前拖动的元素
  var $currentDrogEle = null; // 缓存当前拖动的元素$对象
  var $editingTextEle = null; // 缓存当前拖动的元素$对象
  var mousePosition, mouseStartX, mouseStartY, dragLeft, dragTop, dragMaxH, dragMaxW, mouseOffsetX, mouseOffsetY;  // 定义按下鼠标产生的变量
  var oldWidth = 0, oldHeight = 0, dbclickTime = 600;
  var preClick, currentClick, cancelClickTime, isEditing;

  // 判断是否是拖拽区域的元素,非文本操作取消选中
  $('body').on('mousedown', function(e) {
    var isInCurrentDrogEle = $currentDrogEle ? $currentDrogEle[0].contains(e.target) : true;
    var isInTextStyleOpt = $('.textStyleOpt')[0].contains(e.target);
    if (isInCurrentDrogEle || isInTextStyleOpt) {
      return
    }
    $currentDrogEle.removeClass('focus');
    $currentDrogEle = null;
    currentEle = null;
  });

  $('body').on('mousedown', '.drag', startDrag);
  $('body').on('mouseup', '.drag', function(e) {
    var now = Date.now();
    if (now - (preClick || 0) > (dbclickTime / 2)) {
      preClick = null;
      cancelClickTime = null
    } else {
      cancelClickTime = now
    }
  });

  // 在文本元素里面右键阻止菜单,并且退出文本编辑
  $(document).bind("contextmenu", function(e) {
    var isInCurrentDrogEle = $currentDrogEle && $currentDrogEle[0].contains(e.target);
    if (isInCurrentDrogEle) {
      isEditing = false;
      $editingTextEle && $editingTextEle.attr('contentEditable', false);
      return false;
    }
  });

  function startDrag(e) {
    currentEle = this;
    $currentDrogEle = $(this)
    mouseStartX = e.clientX; // 按下鼠标时，相对于浏览器边界的x坐标
    mouseStartY = e.clientY;  // 按下鼠标时，相对于浏览器边界的Y坐标
    mouseOffsetX = e.offsetX;
    mouseOffsetY = e.offsetY;
    dragLeft = $currentDrogEle.offset().left; // 按下鼠标时，拉伸框距离容器顶部的距离
    dragTop = $currentDrogEle.offset().top;  // 按下鼠标时，拉伸框距离容器顶部的距离
    cAreaH = cArea.height(); //容器高度
    cAreaW = cArea.width();  // 容器宽度
    dragMaxH = cAreaH - drag.height();  //垂直移动最大范围
    dragMaxW = cAreaW - drag.width();  // 水平移动最大范围
    mousePosition = $(e.target).attr('data-type');  // 判断按下的位置 是中间还是边上的拉伸点
    $('.cDel').on('click', delEle);

    // 编辑状态禁止拖拽,否则不支持编辑过程选中文字
    if (!isEditing && e.button === 0) {
      // 判断双击事件
      if ($(e.target).hasClass('drogText') && preClick && cancelClickTime && Date.now() - cancelClickTime < (dbclickTime / 2)) {
        preClick = null;
        if ($currentDrogEle.attr('ele-type') === 'text') {
          isEditing = true;
          $editingTextEle = $currentDrogEle.find('.drogText');
          $editingTextEle.attr('contentEditable', true);
          $editingTextEle.on('input focus', editingText);
        }
      } else {
        preClick = Date.now()
        $editingTextEle && $editingTextEle.attr('contentEditable', false);
        e.preventDefault();
        $(document).on('mousemove', dragging).on('mouseup', clearDragEvent);
        editText($currentDrogEle)
      }
      currentClick = null
      cancelClickTime = null
    }
  }

  function editingText(e) {
    if ($editingTextEle && ($editingTextEle.innerHeight() > $currentDrogEle.height())) {
      $currentDrogEle.css({
        'height': $editingTextEle.innerHeight()
      })
    }
  }

  function editText($currentDrogEle) {
    $currentDrogEle.addClass('focus').siblings().removeClass('focus');
    if ($currentDrogEle.attr('ele-type') === 'text') {
      var textNode = $currentDrogEle.find('.drogText')
      // $(".fontSize").select2('val', textNode.css('font-size'));
      changeFamily(textNode)
    }
  }

  function changeFamily(textNode) {
    var cssObj = {
      'font-size': textNode.css('font-size'),
      'font-weight': textNode.css('font-weight'),
      'color': textNode.css('color').colorHex(),
      'font-family': textNode.css('font-family') || rootFontFamily,
    }

    $(".fontSize").val(cssObj["font-size"]).trigger('change');
    $(".fontWeight").val(cssObj["font-weight"]).trigger('change');
    // $(".fontFanmily").val(cssObj["font-family"]).trigger('change');
    $(".fontColor").val(cssObj["color"]);

    $(".inputText").val(textNode.text());
    // $(".textStyleBox .drogText").css(cssObj).val(textNode.text());
  }

  function delEle(e) {
    $(e.target).parent('.drag').remove()
  }

  /**
   * 监听鼠标移动
   * @param e
   */
  function dragging(e) {
    preClick = null;
    currentClick = null;
    cancelClickTime = null;
    $('input,textarea,select').blur();
    e.stopPropagation();
    // window.getSelection().removeAllRanges();
    switch (mousePosition) {
      case 'drag' :
        dragMove(e);
        break;
      case 'cUp' :
        upDownMove(e, 'up');
        break;
      case 'cDown' :
        upDownMove(e, 'down');
        break;
      case 'cLeft' :
        leftRightMove(e, 'left');
        break;
      case 'cRight' :
        leftRightMove(e, 'right');
        break;
      case 'cLeftUp' :
        leftRightMove(e, 'left');
        upDownMove(e, 'up');
        break;
      case 'cLeftDown' :
        leftRightMove(e, 'left');
        upDownMove(e, 'down');
        break;
      case 'cRightUp' :
        leftRightMove(e, 'right');
        upDownMove(e, 'up');
        break;
      case 'cRightDown' :
        leftRightMove(e, 'right');
        upDownMove(e, 'down');
        break;
      default :
        break;
    }
  }

  /**
   * 拉伸框整体移动
   * @param e
   */
  function dragMove(e) {
    var moveX = e.pageX - cArea.offset().left - mouseOffsetX; // 拖拽中  当前坐标 - 初始坐标
    var moveY = e.pageY - cArea.offset().top - mouseOffsetY;
    var destinationX = Math.min((moveX), dragMaxW); //限制拖动最大范围
    var destinationY = Math.min((moveY), dragMaxH);
    $currentDrogEle.css({
      left: destinationX < 0 ? 0 : destinationX,
      top: destinationY < 0 ? 0 : destinationY
    });
  }

  /**
   * 鼠标松开 释放事件
   * @param e
   */
  function clearDragEvent(e) {
    $(document).off('mousemove', dragging).off('mouseup', clearDragEvent);
  }

  /**
   * 上下方向的边框拖动
   * @param e event事件
   * @param direction  方向
   */
  function upDownMove(e, direction) {
    var draggingY = e.pageY - cArea.offset().top;
    if (draggingY < cAreaTop) draggingY = draggingY > 0 ? draggingY : 0;  // 限制最多只能移动到容器的上下边界
    if (draggingY > cAreaH) draggingY = cAreaH;
    var dragY = getPosition(currentEle).Y;
    if (direction === 'up') {
      var changeHeight = dragY - draggingY;
      $currentDrogEle.css('top', draggingY);
    } else if (direction === 'down') {
      var changeHeight = draggingY - parseFloat($currentDrogEle.css('height')) - dragY;
    }
    oldHeight += changeHeight;
    var endHeight = changeHeight + parseFloat($currentDrogEle.css('height'));
    $currentDrogEle.css('height', endHeight);
  };

  /**
   * 水平方向的边框拖动
   * @param e event
   * @param direction 方向
   */
  function leftRightMove(e, direction) {
    var draggingX = e.pageX - cArea.offset().left;
    if (draggingX < cAreaLeft) draggingX = draggingX > 0 ? draggingX : 0;
    if (draggingX > cAreaW) draggingX = cAreaW;
    var dragX = getPosition(currentEle).X;

    if (direction === 'left') {
      var changeWidth = dragX - draggingX;
      $currentDrogEle.css('left', draggingX);
    } else if (direction === 'right') {
      var changeWidth = draggingX - parseFloat($currentDrogEle.css('width')) - dragX;
    }
    oldWidth += changeWidth;
    var endWidth = changeWidth + parseFloat($currentDrogEle.css('width'));
    $currentDrogEle.css('width', endWidth);
  };


  /**
   * 获取元素距离父容器的距离
   * @param elem  容器
   */
  function getPosition(elem) {
    var elemX = $(elem).position().left; // 相对于element.offsetParent节点的左边界偏移像素值
    var elemY = $(elem).position().top;  // 相对于element.offsetParent节点的上边界偏移像素值
    return {
      X: elemX,
      Y: elemY
    };
  };


  ///////////////////////////////////////////////////////////////
  // 图片拖拽功能
  var $container = cArea;   //移入的容器
  var $dragItem = $('.drag-item'); // 可以拖动的元素
  var eleDrag = null; //当前被拖动的元素
  var endPosition = {
    left: '',
    top: ''
  };  // 放开元素时的鼠标坐标

  $dragItem.on('selectstart', function() {
    return false;
  }).on('dragstart', function(ev) {
    // 拖拽开始  jquery里面需要使用ev.originalEvent.dataTransfer  原生js使用ev.dataTransfer就行了
    ev.originalEvent.dataTransfer.effectAllowed = 'move';
    eleDrag = ev.target;
    return true;
  }).on('dragend', function(ev) {
    eleDrag = null;
    return false;
  });

  $container.on('dragover', function(ev) {
    ev.preventDefault();
    return true;
  }).on('dragenter', function(ev) {
    // 给目标元素设置边框效果，提示元素进入
    // $(this).toggleClass('active');
    return true;
  }).on('drop', function(ev) {
    // 记录当前的坐标，为拖拽结束时，拉伸框定位用
    endPosition.left = ev.originalEvent.layerX;
    endPosition.top = ev.originalEvent.layerY;
    if (eleDrag) {
      setHtml(eleDrag)
    }
    $(this).toggleClass('active');
  });

  // 这里是把拖拽元素，加上一些编辑效果，然后加入到目标元素里面
  function setHtml(eleDrag) {
    // 这里用的是attr拿图片地址
    // 其实也可以用  ev.originalEvent.dataTransfer.getData('url')  getData来拿拖拽元素的url
    var src = $(eleDrag).attr('src');
    var dropEle, eleType, dropEleW, dropEleH;
    var classname = 'drag'
    var $dragEle = $('<div>');
    var directionBtn = $('.cacheEle').html();

    if (src) {
      dropEle = $('<img>')
      eleType = 'image'
      dropEle.attr('src', $(eleDrag).attr('src')).attr('data-type', 'drag');
    } else {
      dropEle = $(eleDrag).clone();
      const paddingpx = 10
      dropEle.css({
        'text-align': 'initial',
        'padding': paddingpx
      })
      // $dragEle.css({
      //   'width': $(eleDrag).innerWidth() + paddingpx * 2,
      //   'height': $(eleDrag).innerHeight() + paddingpx * 2
      // })
      eleType = 'text'
      classname += ' text'
      dropEle.attr('data-type', 'drag');
    }

    $dragEle.addClass(classname).attr('data-type', 'drag').attr('ele-type', eleType).html(dropEle).append(directionBtn);
    $dragEle.css({
      'left': endPosition.left - (100 / 2),
      'top': endPosition.top - (100 / 2),
      'position': 'absolute',
      'box-sizing': 'border-box',
      'z-index': '999',
      'text-align': 'center'
    });
    $container.append($dragEle);
    $currentDrogEle = $dragEle;
    editText($currentDrogEle);
  }

  $('.inputText').on('input', function(e) {
    $('#contentAboutText .drogText').text(e.target.value);
    var textNode = $currentDrogEle && $currentDrogEle.find('.drogText');
    textNode && textNode.text(e.target.value);
  })

  $(".fontSize").select2({
    width: '100px',
    data: Array.apply(null, { length: 100 }).map(function(item, index) {
      var px = index + 1 + 'px'
      return {
        id: px,
        text: px
      }
    })
  }).on('select2:select', function(e) {
    var data = e.params.data;
    var textNode = $currentDrogEle && $currentDrogEle.find('.drogText');
    textNode && textNode.css('font-size', data.id)
    $editingTextEle && $editingTextEle.focus()
    // $('.inputText').css('font-size', data.id)
    // $('.textStyleBox .drogText').css('font-size', data.id)
  });

  var arrFont = dataFont['windows'].concat(dataFont['OS X'], dataFont['office'], dataFont['open']);
  var supportFont = [];
  arrFont.forEach(function(obj) {
    var fontFamily = obj.en;
    if (isSupportFontFamily(fontFamily)) {
      supportFont.push({
        id: fontFamily,
        text: obj.ch
      })
    }
  });
  $(".fontFanmily").select2({
    width: '200px',
    data: supportFont
  }).on('select2:select', function(e) {
    var data = e.params.data;
    var textNode = $currentDrogEle && $currentDrogEle.find('.drogText');
    textNode && textNode.css('font-family', data.id);
    $editingTextEle && $editingTextEle.focus();
    // $('.inputText').css('font-family', data.id);
    // $('.textStyleBox .drogText').css('font-family', data.id);
  });
  $(".fontFanmily").val(supportFont[0].id).trigger('change');

  $(".fontWeight").select2({
    width: '100px',
    data: Array.apply(null, { length: 9 }).map(function(item, index) {
      var weight = (index + 1) * 100
      return {
        id: weight,
        text: weight
      }
    })
  }).on('select2:select', function(e) {
    var data = e.params.data;
    var textNode = $currentDrogEle && $currentDrogEle.find('.drogText');
    textNode && textNode.css('font-weight', data.id);
    $editingTextEle && $editingTextEle.focus();
    // $('.inputText').css('font-weight', data.id)
    // $('.textStyleBox .drogText').css('font-weight', data.id)
  });

  $('.fontColor').change(function(e) {
    var textNode = $currentDrogEle && $currentDrogEle.find('.drogText');
    textNode && textNode.css('color', e.target.value)
    // $('.inputText').css('color', e.target.value)
    // $('.textStyleBox .drogText').css('color', e.target.value)
  })

  $('.saveimg').on('click', function() {
    $('.drag').removeClass('focus');
    var ele = cArea[0]
    html2canvas(ele, {
      width: $(ele).width(),
      height: $(ele).height(),
      x: $(ele).offset().left,
      y: $(ele).offset().top
    }).then(function(canvas) {
      canvas.fillStyle = "#fff";
      var minSizeFile = canvas.toDataURL('image/jpeg', 1);
      var imgdom = $('#base64Img');
      imgdom.attr('src', minSizeFile)
      $('.imgmodal').show()
    });
  });
})()

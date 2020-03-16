(function() {
  var $uploadBg = $('#uploadBg');
  var $uploadOpt = $('#uploadOpt');
  var $canDragEle = $('#editImgEle');
  $uploadBg.on('change', function(e) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var img = new Image();
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        var elew = $canDragEle.width()
        var eleH = $canDragEle.height()
        if (width > elew) {
          img.style.width = '100%'
        } else {
          $canDragEle.width(width)
        }

        $canDragEle.css('height', 'auto')
        $canDragEle.css('background', 'none')
        $canDragEle.html(img)
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  })

  $uploadOpt.on('change', function(e) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var img = new Image();
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        setHtml(img, 0, 0, null, height)
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  })

  function setHtml(eleDrag, x, y, w, h) {
    var src = $(eleDrag).attr('src');
    var $img = null;
    var classname = 'drag'
    var $dragEle = $('<div>');
    var directionBtn = $('.cacheEle').html();
    if (src) {
      $img = $('<img>')
      $img.attr('src', $(eleDrag).attr('src')).attr('data-type', 'drag');
      if (h > 250) {
        h = 250
      }
      $dragEle.css({ 'height': h })
    } else {
      $img = $(eleDrag).clone();
      classname += ' text'
    }

    $dragEle.addClass(classname).attr('data-type', 'drag').html($img).append(directionBtn);
    $dragEle.css({
      'left': x || 0,
      'top': y || 0,
    });
    $canDragEle.append($dragEle);
  }

  $('.closeModal').click(function() {
    $(this).parent().hide()
  })

  $('#drogTextBox').on('mouseenter', function(e) {
    $('#drogTextBox .drogTextTips').show()
  }).on('mouseleave', function(e) {
    $('#drogTextBox .drogTextTips').hide()
  })
})()


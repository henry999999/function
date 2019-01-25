(function(){
    if(typeof ($.fn.maxvision_dropdown) != 'function'){
        $.fn.maxvision_dropdown = function(value, height, flag){
            if(($(this).get(0).tagName != "INPUT") || $(this).attr('type') != 'text' || $.isEmptyObject(value)){
                return;
            }
            var delayTimerID = null;
            var pinyinIndex = {};   //拼音索引
            var searchItem = $(this);   //搜索输入框
            var containerName = 'maxvision_dropdown';
            var isCustomPlaceholder = !('placeholder' in document.createElement('input'));//自定义的placeholder(ie6/7/8)
            var $outerItem = null;
            var containerItem = init(searchItem, value, height);//初始化下拉列表
            var isIE6 = false;
            var oldword = ' ';
            if(!!$.browser){
                isIE6 = $.browser.msie && ($.browser.version == "6.0") && !$.support.style;
            }

            containerName += $('.' + containerName).length;
            searchItem.data('container', containerName);
            containerItem.addClass(containerName);
            // searchItem.click(function(){
            //     containerItem.show(0,hideSelectForIE6);
            //     searchPlatform(''); 
            // })
        
            function init (item, value, height) {
                var paddingLeft = parseInt(item.css('padding-left'));
                var padding = parseInt(item.css('padding-left')) + parseInt(item.css('padding-right'));
                // var newitem = $('<ul class="maxvision_dropdown"></ul>');
                var newitem = $('<div class="maxvision_dropdown"><div class="mui-scroll-wrapper"><div class="mui-scroll"><ul class="ulitem"></ul></div></div></div>');
                if(multiarr(value)){
                    for(var i=0;i<value.length;i++){
                        if(typeof value[i] =='object'){
                            // newitem.append('<li id='+value[i].value+'>'+value[i].text+'</li>');
                            newitem.find(".ulitem").append('<li id='+value[i].value+'>'+value[i].text+'</li>');
                        }
                    }
                }
                else{
                    for(var i in value){
                        // newitem.append('<li data-id="'+i+'">'+value[i]+'</li>');
                        newitem.find(".ulitem").append('<li data-id="'+i+'">'+value[i]+'</li>');
                    }
                }
                newitem.css("max-height", height+"px");
                if (item.data('dropdown-container')) {
                    $outerItem = $(item.data('dropdown-container'))
                    $outerItem.append(newitem);
                } else {
                    $outerItem = newitem;
                    newitem.insertAfter(item);
                }
                if(isCustomPlaceholder){
                    item.parent().css("z-index", "9");
                    // newitem.parent().css('position','relative');
                }
                
                return newitem;
            }
        
            function searchPlatform(keywords, height){
                containerItem.children('li.hover').removeClass('hover');
                if(keywords){
                    var count = 0;
                    containerItem.find('li').hide();
                    containerItem.find('li').filter(function(index){
                        var value = $(this).html();
                        var email = '';
                        if($(this).attr('data-email')){
                            email = $(this).attr('data-email')
                        }
                        if(value.toLowerCase().indexOf(keywords.toLowerCase()) >= 0){
                            count++;
                            return true;
                        }else if($.inArray(index, pinyinIndex[keywords.toLowerCase()]) >= 0){
                            count++;
                            return true;
                        }else if(email!=''&&email.toLowerCase().indexOf(keywords.toLowerCase()) >= 0){
                            count++;
                            return true;
                        }
                        return false;
                    }).show().first().addClass('hover');
                }else{
                    containerItem.find('li').show().first().addClass('hover');
                }
            }
        
            function selectByKeyboard(isUp){//isUp: 向上的方向键触发
                if(!containerItem.find('li:visible').length)
                    return;
                isUp = typeof(isUp) != "boolean" ? true : isUp;
                var items = containerItem.find('li:visible');
                var item = null;
                var value = '';
        
                if(items.hasClass('hover')){
                    if(items.length > 1 ){
                        item = items.filter('.hover');
                        item.removeClass('hover');
                        if(isUp){
                            if(item.prevAll(':visible').length){
                                item = item.prevAll(':visible').eq(0);
                            }else{
                                item = items.last();
                            }
                        }else{
                            if(item.nextAll(':visible').length){
                                item = item.nextAll(':visible').eq(0);
                            }else{
                                item = items.first();
                            }
                        }
                        item.addClass('hover');
                        value = item.html();
                        scrollPanel(items.filter('.hover'));
                    }               
                }else if(!isUp){
                    item = items.first();
                    item.addClass('hover');
                }
                changeValue(item);
            }
        
            function scrollPanel(item){
                var scrollY = containerItem.scrollTop();
                var containerHeight = containerItem.height();
                var y = item.offset().top - containerItem.offset().top;
                if(y < 0){
                    scrollY = scrollY + y;
                }else if( y >= containerHeight ){
                    scrollY = y - containerHeight + item.height() + scrollY;
                }else{
                    return;
                }

                containerItem.animate({scrollTop:scrollY},500);
            }
            
            function multiarr(arr){
                for (var i in arr)
                if( typeof arr[i]=="object")return true;
                return false;
            }

            function changeValue(item){
                searchItem.val(item.html());
                searchItem.trigger('check.maxvisison.dropdown', item);
                var type=false;
                // var bo=item[0].parentElement.parentElement.classList[1];
                // var valueid=item[0].parentElement.parentElement.classList[2];
                // var textid=item[0].parentElement.parentElement.classList[3];
                var bo=item[0].parentElement.parentElement.parentElement.parentElement.parentElement.classList[1];
                var valueid=item[0].parentElement.parentElement.parentElement.parentElement.parentElement.classList[2];
                var textid=item[0].parentElement.parentElement.parentElement.parentElement.parentElement.classList[3];
               	(bo=="true")?type=true:type=false;
                datatodom(item[0].id,item[0].innerText,type,valueid,textid)
            }
            searchItem.bind('focus',function(){
                var value = $(this).val();
                oldword = value;
                $outerItem.show();
                // hideSelectForIE6();
                if(flag){
                    // $(this).val('');
                    // value = null;
                }
                searchPlatform(value, height);
                return false;
            }).bind('keyup', function(event){
                var keywords = $.trim($(this).val());
                if(event.which == 40){//向下方向键
                    selectByKeyboard(false);
                }else if(event.which == 38){//向下方向键
                    selectByKeyboard(true);
                }else if(event.which == 13){
                    if(!containerItem.find('li:visible').length){
                        return false;
                    }
        
                    var value = containerItem.find('li:visible.hover').html();
                    $(this).val(value).get(0).blur();
        
                }else{
                    searchPlatform(keywords, height);            
                }
        
                return false;
            })
            // containerItem.hover(
            //     function () {},
            //     function () {
            //         if(!!delayTimerID){
            //             clearTimeout(delayTimerID);
            //         }
            //         delayTimerID = setTimeout(function(){
            //             // containerItem.closest('.dropdown-container').hide();
            //             showSelectForIE6();
            //         }, 200);
            //         return false;
            //     }
            // );
        
            containerItem.find('li').each(function(index, element){//初始化拼音搜索矩阵
                var name = $(this).html();    
        		var id = element.id;
                var pinyin = pinyinEngine.toPinyin(name, false);
                var idpinyin = pinyinEngine.toPinyin(id, false);
                $.each(pinyin, function(i, eachPinyin){
                    var fullSpell = '';
                    var headSpell = '';
                    if(!$.isArray(eachPinyin)) {
                        eachPinyin = [eachPinyin]
                    }
                    $.each(eachPinyin, function(i, e){
                        fullSpell = fullSpell + e;
                        pinyinIndex[fullSpell] = pinyinIndex[fullSpell] || [];
                        pinyinIndex[fullSpell].push(index); 
        
                        headSpell = headSpell + e.charAt(0);
                        pinyinIndex[headSpell] = pinyinIndex[headSpell] || [];
                        pinyinIndex[headSpell].push(index);
                    });
                })
                $.each(idpinyin, function(i, eachPinyin){
                    var fullSpell = '';
                    var headSpell = '';
                    if(!$.isArray(eachPinyin)) {
                        eachPinyin = [eachPinyin]
                    }
                    $.each(eachPinyin, function(i, e){
                        fullSpell = fullSpell + e;
                        pinyinIndex[fullSpell] = pinyinIndex[fullSpell] || [];
                        pinyinIndex[fullSpell].push(index); 
        
                        headSpell = headSpell + e.charAt(0);
                        pinyinIndex[headSpell] = pinyinIndex[headSpell] || [];
                        pinyinIndex[headSpell].push(index);
                    });
                })
            }); 
        
            containerItem.find('li').bind('click',function(){
                if(!!delayTimerID){
                    clearTimeout(delayTimerID);
                }
                changeValue($(this));
                $(this).parent().children('li.hover').removeClass('hover');
                if(isCustomPlaceholder){
                    searchItem.get(0).focus();
                    searchItem.get(0).blur();                    
                }else{
                    $outerItem.hide();
                }
                return false;
            }).bind('mouseover', function(){
                if(!$(this).hasClass('hover')){
                    $(this).parent().children('li.hover').removeClass('hover');
                    $(this).addClass('hover');
                }
                return false;
            })

            searchItem.on('blur', function(){
                if(flag){
                    var value = $(this).val();
                    if(!value){
                        $(this).val(oldword);
                    }
                }
                if(!!delayTimerID){
                    clearTimeout(delayTimerID);
                }
                delayTimerID = setTimeout(function(){
                    $outerItem.hide();
                 
                }, 200);
            })
        
        };
    }


})();

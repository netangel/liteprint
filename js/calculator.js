var a, o, x = new Object();
x.time = 0; x.price = 0;

var sCurrentUI = 'vis';

function changeUI (key) {
	$('#xCalc').fadeOut('fast', function(){ xSetUI(key); }).fadeIn('fast');
	//	Обновляем кнопочки в меню продуктов
	$("#menu-types LI").removeClass('active');
	$("#menu-types ."+xProducts[key].aClass).parent('LI').addClass('active');
	// Scroll до калькулятора/меню (но не для первого показа страницы)
	var menuHeight = parseInt($("#menu-types").height());
	var footerHeight = parseInt($("#footer").height());
	var windowHeight = parseInt($(window).height());

	if (!firstRun) {
		$('html, body').animate({ scrollTop: $("#menu-types").offset().top - 37 }, 'fast');
	} else {
		firstRun = 0;
	};
	//	149 - sum for margins
	$("div.col-properties").css('min-height', (windowHeight - menuHeight - footerHeight - 149) + 'px');

	return true;
}

//	Отрисовка калькулятора для выбранного продукта
function xSetUI (sUi) {
	var oUI = xProducts[sUi];
	if (oUI == null) { console.log("Продукт не определен!"); return false; }

	sCurrentUI = sUi;
	o = _.extend ({}, oUI);
	a = o.ui;

	//	Удаляем старые элементы
	$("div.col-properties").html('');
	$("#paper-choose, #paper1-choose").html('');

	//	Скроем элементы выбора бумаги
	$("#product-paper, #product-paper1").hide();

	//	Параметры продукта для калькулятора
	for (var key in a) {
		var oRow = a[key];

		//	Enum поле
		if (oRow.type == "enum") {
			//	Заголовок
			$("<div>").addClass('col-label')
					.html( oRow.elemClass == 'form-check' ? ' ' : '<span>'+oRow.name+'</span>' )
					.appendTo('div.col-properties');

			//	Контейнер для значений
			var container = $("<div>").addClass('col-select');
			if (oRow.elemClass && oRow.elemClass == 'rect-l')
				$(container).addClass('rect').addClass('rect-l');
			else if (oRow.elemClass == 'rect')
				$(container).addClass('rect');
			else if (oRow.elemClass == 'form-check')
				$(container).addClass('form-check');
			else
				$(container).addClass('form-element');

			//	Значения
			if (oRow.elemClass == 'rect' || oRow.elemClass == 'rect-l') {
				for (var i = 0; i < oRow.options.length; i++) {
					var oOption = oRow.options[i];
					$("<a>").attr({
						href: 'javascript://',
						title: oOption.desc != null ? oOption.desc : '',
						key: key,
						value: oOption.v
					}).click(function() {
						var key = $(this).attr('key');
						var value = $(this).attr('value');
						$("a[key="+key+"]").removeClass('active');
						$(this).addClass("active");
						xSetOption(key, value);
					}).html(oOption.title)
					.addClass(oOption.v == oRow.value ? 'active' : '')
					.appendTo(container);
				}

				$("a", container).tooltipster({
			      position: 'bottom',
			      theme: 'tooltipster-shadow'
			    });
			} else if (oRow.elemClass == 'jqselect') {
				var select = $("<select>").attr('onchange', "xSetOption(" + "'" + key + "', this.value)");
				for (var i = 0; i < oRow.options.length; i++) {
					var oOption = oRow.options[i];
					var opt = $("<option>").val(oOption.v).text(oOption.title);
					if (oOption.v == oRow.value) $(opt).prop('selected', true);
					$(opt).appendTo(select);
				}
				$(select).appendTo(container);
			} else if (oRow.elemClass == 'form-check') {
				$("<input>").attr({
					id: sUi + "_" + key,
					type: 'checkbox',
					key: key,
					default: oRow.options[0].v
				}).change(function() {
					xSetOption( $(this).attr('key'), this.checked ? $(this).val() : $(this).attr('default') );
				}).val(oRow.options[1].v)
				.appendTo(container);
				$("<label>").attr('for', sUi + "_" + key)
							.text(oRow.options[1].title)
							.appendTo(container);

				if (oRow.options[1].desc) {
					$(container).append('<a href="javascript://" title="' + oRow.options[1].desc + '" class="form-check-tooltip">(?)</a>');
					$(".form-check-tooltip", container).tooltipster({
				      position: 'bottom',
				      theme: 'tooltipster-shadow'
				    });
				};
			}
			
			$(container).appendTo('div.col-properties');
		} else if (oRow.type == "int") {
			//	Заголовок
			$("<div>").addClass('col-label')
					.html( oRow.elemClass == 'form-check' ? ' ' : '<span>'+oRow.name+'</span>' )
					.appendTo('div.col-properties');

			//	Контейнер для значений
			var container = $("<div>").addClass('col-select');
			if (oRow.elemClass && oRow.elemClass == 'rect-l')
				$(container).addClass('rect').addClass('rect-l');
			else if (oRow.elemClass == 'rect')
				$(container).addClass('rect');
			else if (oRow.elemClass == 'form-check')
				$(container).addClass('form-check');
			else
				$(container).addClass('form-element');

			$("<input>").attr({
				id: sUi + "_" + key,
				type: 'text',
				key: key,
				maxlength: 5
			}).keyup(function() {
				xCheckInt($(this).attr('key'), false);
				xSetOption($(this).attr('key'), parseInt(this.value), false);
			}).change(function() {
				xCheckInt($(this).attr('key'), false);
				xSetOption($(this).attr('key'), parseInt(this.value), false);
			}).val(oRow.value)
			  .addClass('styler')
			  .appendTo(container);

			var amount_div = $("<div>").addClass('amount');
			// "–" Button
			$("<a>").attr({
				href: 'javascript://', 
				key: key
			}).click(function() {
				xIncrementOption($(this).attr('key'), -1);
			}).addClass('btn-m')
			  .appendTo(amount_div);

			// "+" Button
			$("<a>").attr({
				href: 'javascript://',
				key: key
			}).click(function() {
				xIncrementOption($(this).attr('key'), 1);
			}).addClass('btn-p')
			  .appendTo(amount_div);

			$(amount_div).appendTo(container);

			if (oRow.presets != null) {
				for (var i = 0; i < oRow.presets.length; i++) {
					$("<a>").attr({
								href: 'javascript://',
								key: key,
								value: oRow.presets[i]
							}).click(function() {
								var key = $(this).attr('key');
								$("#" + sUi + "_" + key).val( $(this).attr('value') ).change();
							}).addClass('amount-change')
							.text(oRow.presets[i])
							.appendTo(container);
				} 
			}

			$(container).appendTo('div.col-properties');
		} else if (oRow.type == "paper") {
			var bValueSuitable = false;                           
			
			if (xSidesFromColor(a[oRow.sidesVar].value) <= xMedia[oRow.value].sides) {
				bValueSuitable = true;
			}

			var default_paper = '';

			for (var paper in xMedia) {
				if (paper == oRow.value) default_paper = paper;
				var oPaper = xMedia[paper];
				var re = new RegExp("(?:^|,)" + oPaper.group + "(?:,|$)", "i");
				if (xSidesFromColor(a[oRow.sidesVar].value) <= oPaper.sides	&& re.test(oRow.groups)) {
					if (!bValueSuitable) {
						xSetOption(key, paper, false);
						bValueSuitable = true;
					}
					//	Элемент для выбора бумаги
					var paperBlock = $("<div>").addClass('paper-block').attr({
						id: paper,
						onclick: 'xSetOption("' + key + '", "' + paper + '");'
					});

					//	Графика для отображения бумаги (background)
					$(paperBlock).css({
						'background-color': 'white',
						'background-image': 'url("http://liteprint.me/i/paper_big/'+paper+'-curl.jpg")',
						'background-position': '0px 0px'
					});

					var sPaperName = oPaper.name;
					var aTemp = sPaperName.split(", ");
					sPaperName = aTemp[0];
					var sPaperDescr = null;
					if (aTemp[1] != null) sPaperDescr = '<em>' + aTemp[1] + '</em>';
					$("<p>").html(sPaperName + (sPaperDescr ? "<br />" + sPaperDescr : '')).appendTo(paperBlock);

					if (oPaper.comments) {
						$(paperBlock).attr('title', oPaper.comments);
						$(paperBlock).tooltipster({
					      position: 'bottom',
					      theme: 'tooltipster-shadow',
					      maxWidth: 300
					    });
					    $(paperBlock).click(function() {
					    	$(this).tooltipster('hide');
					    });
					}

					$(paperBlock).appendTo('#' + key + '-choose');
				}
			}
			//	Заголовок элемента
			$("#product-"+key+" a.paper-header").text(oRow.name);
			//	Бумага по-умолчанию
			if (default_paper != '') {
				$("#product-"+key).css({
					'background-color': 'white',
					'background-image': 'url("http://liteprint.me/i/paper_big/'+default_paper+'.jpg")',
					'background-position': '0px 0px'
				});
				var sPaperName = xMedia[default_paper].name;
				var aTemp = sPaperName.split(", ");
				sPaperName = aTemp[0];
				var sPaperDescr = null;
				if (aTemp[1] != null) sPaperDescr = '<em>' + aTemp[1] + '</em>';
				$("#product-"+key+" p").html(sPaperName + (sPaperDescr ? "<br />" + sPaperDescr : ''));
			};

			$("#product-"+key).show();
		}
		
	}

	$("div.col-properties select, div.col-properties input").styler({
		onSelectOpened: function() {  
		$(this).find('.jq-selectbox__trigger-arrow').css('background-position', 'left -20px');},
		onSelectClosed: function() {  
		$(this).find('.jq-selectbox__trigger-arrow').css('background-position', 'left 0px');}
	}); 

	xCalculate();

	return true;
}

function xSetOption (key, value, renderInterface) {
	// console.log("Key: ", key, ", Value: ", value);

	if (a[key]!=null) {
		a[key].value = value;
		if (a[key].title != null) {
			if (a[key].options!= null && a[key].type == 'enum')
				a[key].title = _.detect(a[key].options, function(oX){return oX.v == value}).title;

			if (a[key].type == 'paper')
				a[key].title = xMedia[value].name;
		}

		xCalculate();
		
		if (a[key].type == 'int')
			$('#xOption_'+key+' input[type=text]').attr('value',value);

		if (a[key].type == 'paper') {
			//	Показываем выбранную бумагу
			$("#product-"+key).css({
				'background-color': 'white',
				'background-image': 'url("http://liteprint.me/i/paper_big/'+value+'.jpg")',
				'background-position': '0px 0px'
			});
			var sPaperName = xMedia[value].name;
			var aTemp = sPaperName.split(", ");
			sPaperName = aTemp[0];
			var sPaperDescr = null;
			if (aTemp[1] != null) sPaperDescr = '<em>' + aTemp[1] + '</em>';
			$("#product-"+key+" p").html(sPaperName + (sPaperDescr ? "<br />" + sPaperDescr : ''));

			//	Закрываем список
			$.fancybox.close();

			//	Скролл к меню печатной продукции
			$('html, body').animate({ scrollTop: $("#menu-types").offset().top - 37 }, 'fast');
		};
	}

	return true;
}

function xCalculate () {
	var price = 0;
	var time = 0;
	var html="";
	var bCorrect = true;
	if (a.aa != null) a.aa = function(){};
	var aa = $.extend(true,{},a);

	for (var key in a) {
		var oRow = a[key];
		var oRowA = aa[key];
		if (oRowA.aa!=null) oRowA.aa=function(){};
		if (oRowA.presets!=null) oRowA.presets=function(){};
		if (oRowA.options!=null) oRowA.options=function(){};
		if (oRowA.type!=null) oRowA.type=function(){};
		if (oRowA.groups!=null) oRowA.groups=function(){};
		if (oRowA.min!=null) oRowA.min=function(){};
		if (oRowA.max!=null) oRowA.max=function(){};
		if (oRowA.increment!=null) oRowA.increment=function(){};
		if (xCheckInt(key, false)) {
			if (oRow.qty != null)
				oRowA.qty =  eval (oRow.qty).toString();
			if (oRow.overhead != null) {
				if (oRow.overheadFormula != null) {
					oRowA.overhead = eval (oRow.overheadFormula).toString();
					oRowA.overheadFormula = function(){};
				} else {
					 oRowA.overhead = eval (oRow.overhead).toString();
				}
			}
			if (oRow.price != null) {
				var nPrice = parseFloat(eval (oRow.price));
				if (isNaN(nPrice) == false) {
					nPrice = Math.round(nPrice);
					oRowA.price = nPrice.toString();
					price += nPrice;
				}
			}  
		} else {
			bCorrect = false;
		}
		
		if (oRow.time != null) {
			var nTime = parseInt(eval (oRow.time));
			if (isNaN(nTime) == false) {
				oRowA.time = nTime.toString();
				time += nTime;
			}  
		}

		if (oRowA.title != null && oRowA.value != null) {
			oRowA.value = oRowA.title;
			oRowA.title = function(){};
		}
	
		if ( (oRowA.time == '0' && oRowA.price == null) || (oRowA.time == null && oRowA.price == '0') || (oRowA.price=='0' && oRowA.time=='0') ) 
			aa[key] = function(){};
	}

	x.price = price.toFixed(0);
	x.price1 = Math.round((x.price/a.qty.value)/0.01)/100
	x.price20 = xConst.priceRoundingBase*Math.ceil (price*0.8/xConst.priceRoundingBase);

	x.time = xConst.timeRoundingBase*Math.ceil((time/24)/xConst.timeRoundingBase);
	x.time_string = (x.time < 1.1) ? 'сутки.' : Math.floor(x.time) + '-' + Math.ceil(x.time) + ' р/дн.';

	
	if (bCorrect) {
		a.aa=$.extend(true,{},aa);
		// if (this.wJSON) {$("#zText").html(wJSON.stringify(aa))};  
		$("p.summary").html(eval(o.desc));   
		$("p.price-full").html(x.price+"<small> </small><i>у</i>");
		// $("span.price-dogovor").html(x.price20+"<small> </small><i>у</i>");
		$("p.price-one").html(x.price1+"<small> </small><i>у</i>/экз.");
		// $("#xDetailedPrice").html('<div style="font-size:90%;position:absolute;left:0;top:3px;width:70px;color:#888;">Расклад по цене</div>'+html)
	 } else {
		$("p.summary").html('<span style="color:red">'+eval(o.err)+'</span>');
		$("p.price-full").html('');
		$("span.price-dogovor").html('');
		$("p.price-one").html('');
		// $("#xDetailedPrice").html('');
	}

	return true;
}

function xSidesFromColor (color) {
	if (color.match(/\+/)) {
		var aC = color.split("+");
		if (aC[0]=="0" || aC[1]=="0") {
			return 1;
		} else {
			return 2;
		}
	} else {
		return 2;
	}
}

function xCheckInt(key, bUpdateValue) {
	if (a[key].type == 'int') {
		var nVal = parseInt($("#" + sCurrentUI + "_" + key).val());
		var bCorrect = true;
		if (isNaN(nVal) || nVal < a[key].min || nVal > a[key].max) bCorrect = false;
		if (bCorrect == false) {
			if (bUpdateValue) {
				if (isNaN(nVal) || nVal < a[key].min) {
					a[key].value = a[key].min;
				} else {
					a[key].value = a[key].max;
				}
				$("#" + sCurrentUI + "_" + key).val(a[key].value);				
			} else {
				// $('#xOption_'+key+' input[type=text]').attr('style','border:1px solid #ff0000;color:#ff0000;');
				return false;
			}
		} else {
			// $('#xOption_'+key+' input[type=text]').attr('style','');
			return true;
		}
	}

	return true;
}

function xIncrementOption (key, koeff) {
	if (a[key] != null) {
		var oRow = a[key];
		var nInc = 1;
		if (oRow.increment != null) nInc = oRow.increment;
		var nVal = parseInt(oRow.value);
		var nValNew = Math.round(koeff*nInc + nVal);
		if (isNaN(nValNew) || nValNew < a[key].min || nValNew > a[key].max)
			nValNew = nVal;

		$("#" + sCurrentUI + "_" + key).val(nValNew).change();
	}
}

function xDecap (s) {
	return s.substr(0,1).toLowerCase()+s.substr(1);
}

function xPerSheet(add) {
	var k = (add != null && isNaN(parseFloat(add)) != true) ? parseFloat(add) : 0;
	var mX = xConst.maxX;
	var mY = xConst.maxY;
 
	return Math.max( Math.floor(mX/(parseInt(a.sizeX.value)+k)) * Math.floor(mY/(parseInt(a.sizeY.value)+k)), Math.floor(mY/(parseInt(a.sizeX.value)+k)) * Math.floor(mX/(parseInt(a.sizeY.value)+k)) )
}


var xProducts = {
	sheet: {
		name:   "Листовая продукция",
		title:  "Листовая продукция", 
		desc:   "a.qty.value+ ' экз. Формат '+a.size.title+', ' + a.color.title + ', ' + xDecap(a.paper.title)+ ( (a.laminating.value!=0)? ((a.laminating.value==1)?'. <b class=\"red\">Односторонняя ламинация</b>':'. <b class=\"red\">Двусторонняя ламинация</b>'):'') + ((a.rounding.value!=0)?'. Кругление '+a.rounding.title:'') + '. Срок исполнения – ' + x.time_string + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://liteprint.me/i/calc/sheet1.jpg",             //URL картинки
		aClass: "type-list",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * (parseFloat(a.paper.overhead)+ Math.ceil( parseFloat(a.qty.value)/parseFloat(a.size.value) ))",
					time:"24"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)), 2.4, 0.70 ))"
			},
			ops:    {name:"Обслуживание",
					type:"formula",
					price:"150"
			},
			diecut: {name:"Резка",
					type:"formula",
					price:"xConst.oneCut * Math.ceil(3+a.size.value/2)"
			},
			size:  {name:"Формат", 
					type:"enum", 
					value:1,
					title:"А3",
					options:[
						{title:"А3", v:"1", desc:"30×42 см"},
						{title:"А4", v:"2", desc:"21×29.7 см"},
						{title:"А5", v:"4", desc:"15×21 см"},
						{title:"А6", v:"8", desc:"10×15 см"}
					],
					elemClass: "rect"
			},
			color:  {name:"Печать", 
					type:"enum", 
					value:"4+0",
					title:"4+0",
					options:[
						{title:"4+0", v:"4+0", desc:"Односторонняя цветная печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"4+4", v:"4+4", desc:"Двусторонняя цветная печать"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"},
						{title:"1+0", v:"1+0", desc:"Односторонняя ч/б печать"},
						{title:"без печати", v:"0+0", desc:"Без печати"}
					],
					elemClass: "rect-l"
			},
			qty:    {name:"Тираж", 
					type:"int", 
					units:"экз.",
					min:1, 
					max:99999, 
					increment:10, 
					value:50,
					presets:[100,200,300,500,1000]
			},
			paper:  {name:"Страницы",
					type:"paper",
					groups:"Бумага,Картон,Самоклейка",
					value:"gc157",
					title:"Глянцевая меловка, 160г/м²",
					sidesVar:"color",
					price:"xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					qty:"Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value))",
					overhead:"3",
					overheadFormula:"(a.laminating.value==0)?3:a.laminating.value*10"
			},
			paperMarkup: {name:"Наценка на бумагу",
					type:"formula",
					price:"xConst.paperMarkup * xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))"
			},
			laminating:  {name:"Лами­на­ци­я",  
					type:"enum", 
					value:0,
					title:"нет",
					options:[
						{title:"нет", v:"0"},
						{title:"односторонняя", v:"1"},
						{title:"двусторонняя", v:"2"}
					],
					price:"xConst.oneSideLaminationPrice * parseFloat(a.laminating.value)*(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					time:"(parseFloat(a.laminating.value)>0)?12:0",
					elemClass: "jqselect"
			},
			rounding:  {name:"Скругление",  
				type:"enum", 
				value:0,
				title:"без кругления углов",
				options:[
					{title:"без кругления углов", v:"0"},
					{title:"с 4-х сторон", v:"1"}
				],
				price:"xConst.oneRoundingPrice * parseFloat(a.rounding.value)*parseFloat(a.qty.value)",
				time:"(parseFloat(a.rounding.value)>0)?3:0",
				elemClass: "jqselect"
			},
			design:{name:"Дизайн", 
				type:"enum", 
				value:0,
				title:"макет готов",
				options:[
					{title:"макет готов", v:"0"},
					{title:"доработка макета", v:"300"},
					{title:"макет с нуля", v:"1800"},
				],
				price:"parseFloat(a.design.value)",
				elemClass: "jqselect"
			},
			delivery:{name:"Доставка", 
				type:"enum", 
				value:0,
				title:"без доставки",
				options:[
					{title:"без доставки", v:"0"},
					{title:"Доставка по Архангельску", v:"1"}
				],
				price:"xConst.deliveryArkh * parseFloat(a.delivery.value)",
				elemClass: "form-check"
		   },
		   express:{name:"Исполнение", 
			   type:"enum", 
			   value:'1',
			   title:"в обычном режиме",
			   options:[
				   {title:"в обычном режиме", v:"1"},
				   {title:"Вне очереди (+30% к стоимости)", v:"1.3", desc:"В течение суток."}
			   ],
			   price:"price*(parseFloat(a.express.value)-1)",
			   time:"(parseFloat(a.express.value)>1)?-time+24:0",
			   elemClass: "form-check"
			},
			markup:{name:"Маржа",
				value:"Без скидки",
				type:"formula",
				price:"price*xConst.markup"
			}
		}
	},
	brochure: {
		name:   "Многолистовое издание",
		title:  "Многостраничные издания", 
		desc:   "a.qty.value+ ' экз. Формат '+a.size.title+', объём '+a.pages.value+' стр. плюс обложки. Переплёт – '+a.bind.title+'.<br/><b>Обложка:</b> ' + a.color.title + ', ' + xDecap(a.paper.title) + ((a.laminating.value!=0)?((a.laminating.value==1)?', <b class=\"red\">односторонняя ламинация</b>':', <b class=\"red\">двусторонняя ламинация</b>'):'')+ '. <br /><b>Страницы: </b> '+ a.color1.title + ', ' + xDecap(a.paper1.title) + '. <br />Срок исполнения – ' + x.time_string + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://liteprint.me/i/calc/brochure.jpg",             //URL картинки
		aClass: "type-multi",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units+'",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго, обложка",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * (parseFloat(a.paper.overhead)+Math.ceil(2*parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					time:"72"
			},
			print1:  {name:"Индиго, страницы",
					type:"formula",
					price:"xConst.basePrice * eval(a.color1.value) * Math.ceil((parseFloat(a.qty.value)+(parseFloat(a.qty.value)*parseFloat(a.paper1.overhead)/100))*parseFloat(a.pages.value)/(2*parseFloat(a.size.value)))",
					time:"0"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000(Math.ceil(2*parseFloat(a.qty.value)/parseFloat(a.size.value)) + Math.ceil(parseFloat(a.qty.value)*parseFloat(a.pages.value)/(2*parseFloat(a.size.value))) + Math.ceil(parseFloat(a.paper1.overhead)*parseFloat(a.pages.value)/(2*parseFloat(a.size.value))), 2.4, 0.70 ))"
			},
			ops:    {name:"Обслуживание",
					type:"formula",
					price:"150"
			},
			diecut: {name:"Резка",
					type:"formula",
					price:"xConst.oneCut * Math.ceil(10+parseFloat(a.size.value))"
			},
			size:  {name:"Формат", 
					type:"enum", 
					value:2,
					title:"А4",
					options:[
						{title:"А4", v:"2", desc:"21×29.7 см"},
						{title:"А5", v:"4", desc:"15×21 см"},
						{title:"А6", v:"8", desc:"10×15 см"}
					],
					elemClass: "rect"
			},
			qty:    {name:"Тираж", 
					type:"int", 
					units:"экз.",
					min:1, 
					max:99999, 
					increment:10, 
					value:100,
					presets:[10,50,100,200,300,500]
			},            
			pages:  {name:"Страниц", 
					type:"int", 
					units:"без обложек",
					min:2, 
					max:512, 
					increment:2, 
					value:16,
					presets:[16,24,32,64]
			},
			color:  {name:"<b>Обложка</b>", 
					type:"enum", 
					value:"4+0",
					title:"4+0",
					options:[
						{title:"4+0", v:"4+0", desc:"Односторонняя цветная печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"4+4", v:"4+4", desc:"Двусторонняя цветная печать"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"},
						{title:"1+0", v:"1+0", desc:"Односторонняя ч/б печать"},
						{title:"без печати", v:"0+0", desc:"Без печати"}
					],
					elemClass: "rect-l"
			},
			laminating:  {name:"Лами­на­ция обложки",  
					type:"enum", 
					value:0,
					title:"нет",
					options:[
						{title:"нет", v:"0"},
						{title:"односторонняя", v:"1"}
					],
					price:"xConst.oneSideLaminationPrice * parseFloat(a.laminating.value)*(parseFloat(a.paper.overhead)+Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					time:"(parseFloat(a.laminating.value)>0)?12:0",
					elemClass: "jqselect"
			},
			paper:  {name:"Обложка",
					type:"paper",
					groups:"Бумага,Картон",
					value:"gc157",
					title:"Глянцевая меловка, 160г/м²",
					sidesVar:"color",
					price:"xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					qty:"Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value))",
					overhead:"5", // Листы
					overheadFormula:"(a.laminating.value==0)?5:a.laminating.value*10"
			},
			color1: {name:"<b>Страницы</b>", 
					type:"enum", 
					value:"4+4",
					title:"4+4",
					options:[
						{title:"4+4", v:"4+4", desc:"Двусторонняя цветная печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"4+0", v:"4+0", desc:"Односторонняя цветная печать"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"},
						{title:"1+0", v:"1+0", desc:"Односторонняя ч/б печать"},
						{title:"без печати", v:"0+0", desc:"Без печати"}
					],
					elemClass: "rect-l"
			},
			paper1: {name:"Страницы",
					type:"paper",
					groups:"Бумага",
					value:"gc157",
					title:"Глянцевая меловка, 160г/м²",
					sidesVar:"color1",
					price:"xMedia[a.paper1.value].price * Math.ceil( (parseFloat(a.paper1.overhead)+parseFloat(a.qty.value))*parseFloat(a.pages.value)/(2*parseFloat(a.size.value)))",
					qty:"Math.ceil( parseFloat(a.qty.value)*parseFloat(a.pages.value)/(2*parseFloat(a.size.value)))",
					overhead:"10", // Проценты
					overheadFormula:"Math.ceil( parseFloat(a.paper1.overhead)*parseFloat(a.pages.value)/(2*parseFloat(a.size.value)))"
			},
			paperMarkup: {name:"Наценка на бумагу",
					type:"formula",
					price:"xConst.paperMarkup * (xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value))) + xMedia[a.paper1.value].price * Math.ceil( (parseFloat(a.paper1.overhead)+parseFloat(a.qty.value))*parseFloat(a.pages.value)/(2*parseFloat(a.size.value))))"
			},
			bind:   {name:"Переплёт", 
					type:"enum", 
					value:"glue",
					title:"клей",
					options:[
						{title:"клей", v:"glue"},
						{title:"скрепка", v:"stitch"},
						{title:"пружина", v:"wireo"},
						{title:"2 болта", v:"2bolts"},
						{title:"3 болта", v:"3bolts"}
					],
					price: "xConst.oneBindPrice[a.bind.value]*(parseFloat(a.paper.overhead)+parseFloat(a.qty.value))",
					elemClass: "jqselect"
			},
			design:{name:"Дизайн", 
				type:"enum", 
				value:0,
				title:"макет готов",
				options:[
					{title:"макет готов", v:"0"},
					{title:"доработка макета", v:"150"},
					{title:"макет с нуля", v:"480"},
				],
				price:"(4+parseFloat(a.pages.value))*parseFloat(a.design.value)",
				elemClass: "jqselect"
			},
			delivery:{name:"Доставка", 
					type:"enum", 
					value:0,
					title:"без доставки",
					options:[
						{title:"без доставки", v:"0"},
						{title:"Доставка по Архангельску", v:"1"}
					],
					price:"xConst.deliveryArkh * parseFloat(a.delivery.value)",
					elemClass: "form-check"
		   },
		   express:{name:"Исполнение", 
			   type:"enum", 
			   value:'1',
			   title:"в обычном режиме",
			   options:[
				   {title:"в обычном режиме", v:"1"},
				   {title:"Вне очереди (+30% к стоимости)", v:"1.3", desc:"В течение двух рабочих дней."}
			   ],
			   price:"price*(parseFloat(a.express.value)-1)",
			   time:"(parseFloat(a.express.value)>1)?-time+48:0",
			   elemClass: "form-check"
			},
			markup:{name:"Маржа",
				value:"Без скидки",
				type:"formula",
				price:"price*xConst.markup"
			}
		}
	},
	booklet: {
		name:   "Буклет 2 сгиба",
		title:  "Буклеты", 
		desc:   "'Тираж ' + a.qty.value+ ' экз. Формат раскрытого '+a.size.title+', печать ' + a.color.title + ', материал – ' + xDecap(a.paper.title) + '. Срок исполнения – ' + x.time_string + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://liteprint.me/i/calc/booklet.jpg",             //URL картинки
		aClass: "type-buklet",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					time:"48"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)), 2.4, 0.70 ))"
			},
			ops:    {name:"Обслуживание",
					type:"formula",
					price:"150"
			},
			diecut: {name:"Резка",
					type:"formula",
					price:"xConst.oneCut * Math.ceil(3+a.size.value/2)"
			},
			folding: {name:"Фальцовка",
					type:"formula",
					price:"(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))*xConst.oneFoldPrice*2",
					time:"(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))/1000*12"
			},
			size:  {name:"Формат раскрытого", 
					type:"enum", 
					value:2,
					title:"А4",
					options:[
						{title:"А3", v:"1", desc:"Свёрнутый 14×30 см"},
						{title:"А4", v:"2", desc:"Свёрнутый 10×21 см"},
						{title:"А5", v:"4", desc:"Свёрнутый 7×15 см"},
						{title:"42×14 см", v:"2.0000000001", desc:"Свёрнутый 14×14 см"} //такой фокус с дробным числом надо делать, когда точное значение уже есть
					],
					elemClass: "rect"
			},
			color:  {name:"Печать", 
					type:"enum", 
					value:"4+4",
					title:"4+4",
					options:[
						{title:"4+4", v:"4+4", desc:"Двусторонняя цветная печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"}
					],
					elemClass: "rect-l"
			},
			qty:    {name:"Тираж", 
					type:"int", 
					units:"экз.",
					min:1, 
					max:5000, 
					increment:10, 
					value:100,
					presets:[10,50,100,200,300,500]
			},
			paper:  {name:"Страницы",
					type:"paper",
					groups:"Бумага,Картон",
					value:"gc157",
					title:"Глянцевая меловка, 160г/м²",
					sidesVar:"color",
					price:"xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					qty:"Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value))",
					overhead:"3"
			},
			paperMarkup: {name:"Наценка на бумагу",
					type:"formula",
					price:"xConst.paperMarkup * xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)))"
			},
			design:{name:"Дизайн", 
				type:"enum", 
				value:0,
				title:"макет готов",
				options:[
					{title:"макет готов", v:"0"},
					{title:"доработка макета", v:"360"},
					{title:"макет с нуля", v:"2100"},
				],
				price:"parseFloat(a.design.value)",
				elemClass: "jqselect"
			},
			delivery:{name:"Доставка", 
					type:"enum", 
					value:0,
					title:"без доставки",
					options:[
						{title:"без доставки", v:"0"},
						{title:"Доставка по Архангельску", v:"1"}
					],
					price:"xConst.deliveryArkh * parseFloat(a.delivery.value)",
					elemClass: "form-check"
		   },
		   express:{name:"Исполнение", 
			   type:"enum", 
			   value:'1',
			   title:"в обычном режиме",
			   options:[
				   {title:"в обычном режиме", v:"1"},
				   {title:"Вне очереди (+30% к стоимости)", v:"1.3", desc:"В течение суток."}
			   ],
			   price:"price*(parseFloat(a.express.value)-1)",
			   time:"(parseFloat(a.express.value)>1)?-time+24:0",
			   elemClass: "form-check"
			},
			markup:{name:"Маржа",
				value:"Без скидки",
				type:"formula",
				price:"price*xConst.markup"
			}
		}
	},
	vis:{
		name:   "Визитка",      //имя для заголовка расчёта
		title:  "Визитки",      //имя для группы
		desc:   "a.qty.value+ ' экз., ' + a.color.title + ', ' + xDecap(a.paper.title) +( (a.laminating.value!=0)? ((a.laminating.value==1)?'. <b class=\"red\">Односторонняя ламинация</b>':'. <b class=\"red\">Двусторонняя ламинация</b>'):'') + ((a.rounding.value!=0)?'. Кругление '+a.rounding.title:'') + '. Срок исполнения – ' + ((x.time<0.51)?'в тот же день.':x.time.toFixed(0)+' р/дн.') + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://liteprint.me/i/calc/vis.jpg",             //URL картинки
		aClass: "type-card",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/24))",
					time:"24"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/24),2.5,2.5 )-1)"
			},
			ops:    {name:"Обслуживание",
					type:"formula",
					price:"50"
			},
			diecut: {name:"Резка",
					type:"formula",
					price:"xConst.oneCut * 16"
			},
			color:  {name:"Печать", 
					type:"enum", 
					value:"4+0",
					title:"4+0",
					options:[
						{title:"4+0", v:"4+0", desc:"Односторонняя печать"},
						{title:"4+4", v:"4+4", desc:"Двусторонняя печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"},
						{title:"1+0", v:"1+0", desc:"Односторонняя ч/б печать"},
						{title:"без печати", v:"0+0", desc:"Без печати"}
					],
					elemClass: "rect-l"
			},
			qty:    {name:"Тираж", 
					type:"int", 
					units:"экз.",
					min:50, 
					max:99999, 
					increment:10, 
					value:100,
					presets:[100,150,200,300,500]
			},
			paper:  {name:"Картон",
					type:"paper",
					groups:"Картон",
					value:"cbr300",
					title:"Картон, 300г/м²",
					sidesVar:"color",
					price:"xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/24))",
					qty:"Math.ceil(parseFloat(a.qty.value)/24)",
					overhead:"2",
					overheadFormula:"(a.laminating.value==0)?2:a.laminating.value*10"
			},
			paperMarkup: {name:"Наценка на бумагу",
					type:"formula",
					price:"xConst.paperMarkup * xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/24))"
			},
			laminating:  {name:"Лами­на­ци­я",  
				type:"enum", 
				value:0,
				title:"нет",
				options:[
					{title:"нет", v:"0"},
					{title:"односторонняя", v:"1"},
					{title:"двусторонняя", v:"2"}
				],
				price:"xConst.oneSideLaminationPrice * parseFloat(a.laminating.value)*(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/24))",
				time:"(parseFloat(a.laminating.value)>0)?12:0",
				elemClass: "jqselect"
			},
			rounding:  {name:"Скругление",  
				type:"enum", 
				value:0,
				title:"без кругления",
				options:[
					{title:"без кругления углов", v:"0"},
					{title:"с 4-х сторон", v:"1"}
				],
				price:"xConst.oneRoundingPrice * parseFloat(a.rounding.value)*parseFloat(a.qty.value)",
				time:"(parseFloat(a.rounding.value)>0)?3:0",
				elemClass: "jqselect"
			},
			design:{name:"Дизайн", 
				type:"enum", 
				value:0,
				title:"макет готов",
				options:[
					{title:"макет готов", v:"0"},
					{title:"доработка макета", v:"90"},
					{title:"макет с нуля", v:"600"},
				],
				price:"parseFloat(a.design.value)",
				elemClass: "jqselect"
			},
			delivery:{name:"Доставка", 
					type:"enum", 
					value:0,
					title:"без доставки",
					options:[
						{title:"без доставки", v:"0"},
						{title:"Доставка по Архангельску", v:"1"}
					],
					price:"xConst.deliveryArkh * parseFloat(a.delivery.value)",
					elemClass: "form-check"
		   },
		   express:{name:"Исполнение", 
			   type:"enum", 
			   value:'1',
			   title:"в обычном режиме",
			   options:[
				   {title:"в обычном режиме", v:"1"},
				   {title:"Вне очереди (+30% к стоимости)", v:"1.3", desc:"В тот же день."}
			   ],
			   price:"price*(parseFloat(a.express.value)-1)",
			   time:"(parseFloat(a.express.value)>1)?-time+8:0",
			   elemClass: "form-check"
			},
			markup:{name:"Маржа",
				value:"Без скидки",
				type:"formula",
				price:"price*xConst.markup"
			}
		}
	},
	calend_q: {
		name:   "Квартальный календарь",
		title:  "Календари", 
		desc:   "a.qty.value+ ' экз. Средние блоки '+a.size.title+', печать ' + a.color.value + ', ' + xDecap(a.paper.title)+ ( (a.laminating.value!=0)? ((a.laminating.value==1)?'. <b class=\"red\">Односторонняя ламинация</b>':'. <b class=\"red\">Двусторонняя ламинация</b>'):'') + '. Срок исполнения – ' + x.time_string + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://ermouth.com/light/calend_q.jpg",             //URL картинки
		aClass: "type-calendar",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * Math.ceil( parseFloat(a.size.value)) * (parseFloat(a.paper.overhead)+ Math.ceil( parseFloat(a.qty.value)) )",
					time:"24"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)*parseFloat(a.size.value)),3.6,3.6 )-1)"
			},
			ops:    {name:"Обслуживание",
					type:"formula",
					price:"250"
			},
			assembly: {name:"Сборка",
					type:"formula",
					price:"xConst.oneCalendarAssembly * (2+ Math.ceil( parseFloat(a.qty.value)) )",
					time:"36"
			},
			tearoffs: {name:"Календарная сетка",
					type:"formula",
					price:"xConst.oneTearOffQuarter * (2+ Math.ceil( parseFloat(a.qty.value)) )"
			},
			othercomponents: {name:"Люверс, бегунок, пружинки",
					type:"formula",
					price:"xConst.oneQuarterCalendCompo * (2+ Math.ceil( parseFloat(a.qty.value)) )"
			},
			size:  {name:"Средние блоки", 
					type:"enum", 
					value:2,
					title:"без печати",
					options:[
						{title:"без печати", v:"2"},
						{title:"с печатью", v:"4"}
					],
					elemClass: "jqselect"
			},
			color:  {name:"Цветность", 
					type:"formula", 
					value:"4+0"
			},
			qty:    {name:"Тираж", 
					type:"int", 
					units:"экз.",
					min:1, 
					max:99999, 
					increment:10, 
					value:50,
					presets:[50,100,150,200,300]
			},
			paper:  {name:"Картон",
					type:"paper",
					groups:"Картон",
					value:"cbr300",
					title:"Картон Crystal Board, 300г/м²",
					sidesVar:"color",
					price:"xMedia[a.paper.value].price * Math.ceil( parseFloat(a.size.value)) * (parseFloat(a.paper.overhead)+ Math.ceil( parseFloat(a.qty.value)) )",
					qty:"Math.ceil( parseFloat(a.size.value)) * Math.ceil( parseFloat(a.qty.value)) ",
					overhead:"3",
					overheadFormula:"Math.ceil( parseFloat(a.paper.overhead))*Math.ceil( parseFloat(a.size.value))+((a.laminating.value==0)?0:a.laminating.value*4)"
			},
			paperMarkup: {name:"Наценка на бумагу",
					type:"formula",
					price:"xConst.paperMarkup * xMedia[a.paper.value].price * Math.ceil( parseFloat(a.size.value)) * (parseFloat(a.paper.overhead)+ Math.ceil( parseFloat(a.qty.value)) )"
			},
			laminating:  {name:"Лами­на­ци­я",  
					type:"enum", 
					value:0,
					title:"нет",
					options:[
						{title:"нет", v:"0"},
						{title:"односторонняя", v:"1"},
						{title:"двусторонняя", v:"2"}
					],
					price:"xConst.oneSideLaminationPrice * parseFloat(a.laminating.value)* Math.ceil( 1+parseFloat(a.size.value)/2) * (parseFloat(a.paper.overhead)+ Math.ceil( parseFloat(a.qty.value)) )",
					time:"(parseFloat(a.laminating.value)>0)?12:0",
					elemClass: "jqselect"
			},
			design:{name:"Дизайн", 
				type:"enum", 
				value:0,
				title:"макет готов",
				options:[
					{title:"макет готов", v:"0"},
					{title:"доработка макета", v:"360"},
					{title:"макет по готовому фото", v:"1200"},
					{title:"макет с нуля", v:"2400"},
				],
				price:"parseFloat(a.design.value)",
				elemClass: "jqselect"
			},
			delivery:{name:"Доставка", 
					type:"enum", 
					value:0,
					title:"без доставки",
					options:[
						{title:"без доставки", v:"0"},
						{title:"Доставка по Архангельску", v:"1"}
					],
					price:"xConst.deliveryArkh * parseFloat(a.delivery.value)",
					elemClass: "form-check"
		   },
		   express:{name:"Исполнение", 
			   type:"enum", 
			   value:'1',
			   title:"в обычном режиме",
			   options:[
				   {title:"в обычном режиме", v:"1"},
				   {title:"Вне очереди (+30% к стоимости)", v:"1.3",desc:"В течение двух дней."}
			   ],
			   price:"price*(parseFloat(a.express.value)-1)",
			   time:"(parseFloat(a.express.value)>1)?-time+48:0",
			   elemClass: "form-check"
			},
			markup:{name:"Маржа",
				value:"Без скидки",
				type:"formula",
				price:"price*xConst.markup"
			}
		}
	},
	wireo: {
		name:   "Продукция на пружине",
		title:  "Продукция на пружине", 
		desc:   "a.qty.value+ ' экз. Формат '+a.size.title+', объём '+a.pages.value+' листов плюс обложки. Пружинный переплёт.'+((a.riegel.value!=0)?' Ригель.':'')+'<br/><b>Обложки:</b> ' + a.color.title + ', ' + xDecap(a.paper.title) + ((a.laminating.value!=0)?((a.laminating.value==1)?', <b class=\"red\">односторонняя ламинация</b>':', <b class=\"red\">двусторонняя ламинация</b>'):'')+ '. <br /><b>Листы: </b> '+ a.color1.title + ', ' + xDecap(a.paper1.title) + ((a.laminating1.value!=0)?((a.laminating1.value==1)?', <b class=\"red\">односторонняя ламинация</b>':', <b class=\"red\">двусторонняя ламинация</b>'):'')+ '. <br />Срок исполнения – ' + x.time_string + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://ermouth.com/light/wireo.jpg",             //URL картинки
		aClass: "type-spine",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units+'",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго, обложка",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * (parseFloat(a.paper.overhead)+Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					time:"72"
			},
			print1:  {name:"Индиго, листы",
					type:"formula",
					price:"xConst.basePrice * eval(a.color1.value) * Math.ceil((parseFloat(a.qty.value)+(parseFloat(a.qty.value)*parseFloat(a.paper1.overhead)/100))*parseFloat(a.pages.value)/(parseFloat(a.size.value)))",
					time:"0"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000( Math.ceil((parseFloat(a.qty.value)*parseFloat(a.pages.value))/parseFloat(a.size.value)), 2.4, 0.70 ))"
			},
			ops:    {name:"Обслуживание",
					type:"formula",
					price:"150"
			},
			diecut: {name:"Резка",
					type:"formula",
					price:"xConst.oneCut * Math.ceil(10+parseFloat(a.size.value))"
			},
			size:  {name:"Формат", 
					type:"enum", 
					value:1,
					title:"А3",
					options:[
						{title:"А3", v:"1", desc:"30×42 см"},
						{title:"А4", v:"2", desc:"21×30 см"},
						{title:"А5", v:"4", desc:"15×21 см"},
						{title:"А6", v:"8", desc:"10×15 см"}
					],
					elemClass: "rect"
			},
			qty:    {name:"Тираж", 
					type:"int", 
					units:"экз.",
					min:1, 
					max:99999, 
					increment:10, 
					value:100,
					presets:[10,50,100,200,300,500]
			},            
			pages:  {name:"Листов", 
					type:"int", 
					units:"без обложек",
					min:1, 
					max:256, 
					increment:1, 
					value:12,
					presets:[6,12,40,64]
			},
			color:  {name:"<b>Обложки</b>", 
					type:"enum", 
					value:"4+0",
					title:"4+0",
					options:[
						{title:"4+0", v:"4+0", desc:"Односторонняя цветная печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"4+4", v:"4+4", desc:"Двусторонняя цветная печать"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"},
						{title:"1+0", v:"1+0", desc:"Односторонняя ч/б печать"},
						{title:"без печати", v:"0+0", desc:"Без печати"}
					],
					elemClass: "rect-l"
			},
			laminating:  {name:"Лами­на­ция обложек",  
					type:"enum", 
					value:0,
					title:"нет",
					options:[
						{title:"нет", v:"0"},
						{title:"односторонняя", v:"1"},
						{title:"двусторонняя", v:"2"}
					],
					price:"xConst.oneSideLaminationPrice * parseFloat(a.laminating.value)*(parseFloat(a.paper.overhead)+Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					time:"(parseFloat(a.laminating.value)>0)?12:0",
					elemClass: "jqselect"
			},
			paper:  {name:"Обложка",
					type:"paper",
					groups:"Бумага,Картон",
					value:"gc157",
					title:"Глянцевая меловка, 160г/м²",
					sidesVar:"color",
					price:"xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value)))",
					qty:"Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value))",
					overhead:"5",
					overheadFormula:"(a.laminating.value==0)?5:a.laminating.value*10"
			},
			color1: {name:"<b>Листы</b>", 
					type:"enum", 
					value:"4+0",
					title:"4+0",
					options:[
						{title:"4+0", v:"4+0", desc:"Односторонняя цветная печать"},
						{title:"4+4", v:"4+4", desc:"Двусторонняя цветная печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"},
						{title:"1+0", v:"1+0", desc:"Односторонняя ч/б печать"},
						{title:"без печати", v:"0+0", desc:"Без печати"}
					],
					elemClass: "rect-l"
			},
			laminating1:  {name:"Лами­на­ция листов",  
				type:"enum", 
				value:0,
				title:"нет",
				options:[
					{title:"нет", v:"0"},
					{title:"односторонняя", v:"1"},
					{title:"двусторонняя", v:"2"}
				],
				price:"xConst.oneSideLaminationPrice * parseFloat(a.laminating1.value)*Math.ceil( (parseFloat(a.paper1.overhead)+parseFloat(a.qty.value))*parseFloat(a.pages.value)/(parseFloat(a.size.value)))",
				time:"(parseFloat(a.laminating1.value)>0)?24:0",
				elemClass: "jqselect"
			},
			paper1: {name:"Страницы",
					type:"paper",
					groups:"Бумага,Картон",
					value:"gc157",
					title:"Глянцевая меловка, 160г/м²",
					sidesVar:"color1",
					price:"xMedia[a.paper1.value].price * Math.ceil( (parseFloat(a.paper1.overhead)+parseFloat(a.qty.value))*parseFloat(a.pages.value)/(parseFloat(a.size.value)))",
					qty:"Math.ceil( parseFloat(a.qty.value)*parseFloat(a.pages.value)/(parseFloat(a.size.value)))",
					overhead:"10",  // Проценты
					overheadFormula:"Math.ceil( parseFloat(a.paper1.overhead)*parseFloat(a.pages.value)/(parseFloat(a.size.value)))+((a.laminating1.value==0)?0:a.laminating.value*5)"
			},
			paperMarkup: {name:"Наценка на бумагу",
					type:"formula",
					price:"xConst.paperMarkup * (xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil( 2*parseFloat(a.qty.value)/parseFloat(a.size.value))) + xMedia[a.paper1.value].price * Math.ceil( (parseFloat(a.paper1.overhead)+parseFloat(a.qty.value))*parseFloat(a.pages.value)/(parseFloat(a.size.value))))"
			},
			bind:   {name:"Переплёт", 
					type:"formula", 
					value:"Пружина",
					title:"пружина",
					price: "xConst.oneBindPrice['wireo']*(parseFloat(a.paper.overhead)+parseFloat(a.qty.value))"
			},
			riegel:{name:"Ригель", 
				type:"enum", 
				value:0,
				title:"без ригеля",
				options:[
					{title:"без ригеля", v:"0",desc:"без петли для крепления на стене"},
					{title:"с ригелем", v:"1",desc:"со специальной петлёй-перекладиной, чтоб на стену можно было повесить"}
				],
				price:"xConst.oneRiegelPrice * parseFloat(a.riegel.value)*parseFloat(a.qty.value)",
				elemClass: "jqselect"
			},
			delivery:{name:"Доставка", 
					type:"enum", 
					value:0,
					title:"без доставки",
					options:[
						{title:"без доставки", v:"0"},
						{title:"Доставка по Архангельску", v:"1"}
					],
					price:"xConst.deliveryArkh * parseFloat(a.delivery.value)",
					elemClass: "form-check"
		   },
		   express:{name:"Исполнение", 
			   type:"enum", 
			   value:'1',
			   title:"в обычном режиме",
			   options:[
				   {title:"в обычном режиме", v:"1"},
				   {title:"Вне очереди (+30% к стоимости)", v:"1.3",desc:"В течение двух рабочих дней."}
			   ],
			   price:"price*(parseFloat(a.express.value)-1)",
			   time:"(parseFloat(a.express.value)>1)?-time+48:0",
			   elemClass: "form-check"
			},
			markup:{name:"Маржа",
				value:"Без скидки",
				type:"formula",
				price:"price*xConst.markup"
			}
		}
	},
	general: {
		name:   "Печатная продукция",
		title:  "Универсальный расчёт", 
		desc:   "a.qty.value+ ' экз. Формат ' + a.sizeX.value + '×' + a.sizeY.value + ' мм (' + xPerSheet(a.bleed.value) + ' на листе), печать ' + a.color.title + ', ' + xDecap(a.paper.title) + '. '+((a.folds.value=='0')?'':'Сгибы – '+a.folds.value+' на экз. ')+((a.creasing.value=='0')?'':'Биговка – '+a.creasing.value+' на экз. ')+ ((a.glue.value=='0')?'':'Склейка – '+a.glue.value+' экз. ') + ((a.wireo.value=='0')?'':'Переплёт на пружину – '+a.wireo.value+' ') + ((a.bolts.value=='0')?'':'Переплёт на болты – '+a.bolts.value+' '+a.bolts.units+' ') + ((a.laminating.value!=0)?((a.laminating.value==1)?' <b class=\"red\">Односторонняя ламинация.</b>':' <b class=\"red\">Двусторонняя ламинация.</b>'):'')+((a.rounding.value!=0)?' Кругление '+a.rounding.title+'.':'')+'<br />Срок исполнения – ' + x.time_string + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://liteprint.me/i/calc/general.gif",             //URL картинки
		aClass: "type-universal",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units+' Максимальный размер '+a.sizeX.max+'×'+a.sizeY.max+' мм, минимальный – '+a.sizeX.min+'×'+a.sizeY.min+' мм.'",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))",
					time:"48"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)), 2.4, 0.70 ))"
			},
			ops:    {name:"Обслуживание",
					type:"formula",
					price:"150"
			},
			diecut: {name:"Резка",
					type:"formula",
					price:"xConst.oneCut * Math.ceil(3+xPerSheet()/2)"
			},
			color:  {name:"Печать", 
					type:"enum", 
					value:"4+0",
					title:"4+0",
					options:[
						{title:"4+0", v:"4+0", desc:"Односторонняя цветная печать"},
						{title:"4+1", v:"4+1", desc:"Двусторонняя печать, лицо – цвет, оборот ч/б"},
						{title:"4+4", v:"4+4", desc:"Двусторонняя цветная печать"},
						{title:"1+1", v:"1+1", desc:"Двусторонняя ч/б печать"},
						{title:"1+0", v:"1+0", desc:"Односторонняя ч/б печать"},
						{title:"без печати", v:"0+0", desc:"Без печати"}
					],
					elemClass: "rect"
			},
			qty:    {name:"Тираж", 
					type:"int", 
					units:"экз.",
					min:1, 
					max:99999, 
					increment:10, 
					value:100,
					presets:[10,50,100,200,300,500]
			},
			sizeX:  {name:"Ширина", 
					type:"int", 
					units:"мм",
					min:20, 
					max:420, 
					increment:5, 
					value:420
			},
			sizeY:  {name:"Высота", 
					type:"int", 
					units:"мм",
					min:20, 
					max:300, 
					increment:5, 
					value:300
			},
			bleed:  {name:"Вылеты", 
					type:"enum", 
					value:"4",
					title:"на два реза",
					options:[
						{title:"на один рез", v:"0"},
						{title:"на два реза", v:"4"}
					],
					elemClass: "jqselect"
			},
			paper:  {name:"Бумага",
					type:"paper",
					groups:"Бумага,Картон,Самоклейка,ТёмныйКартон",
					value:"gc157",
					title:"Глянцевая меловка, 160г/м²",
					sidesVar:"color",
					price:"xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))",
					qty:"Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value))",
					overhead:"5",
					overheadFormula:"(a.laminating.value==0)?5:a.laminating.value*10"
			},
			paperMarkup: {name:"Наценка на бумагу",
					type:"formula",
					price:"xConst.paperMarkup * xMedia[a.paper.value].price * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))"
			},
			laminating:  {name:"Лами­на­ция",  
					type:"enum", 
					value:0,
					title:"нет",
					options:[
						{title:"нет", v:"0"},
						{title:"односторонняя", v:"1"},
						{title:"двусторонняя", v:"2"}
					],
					price:"xConst.oneSideLaminationPrice * parseFloat(a.laminating.value)*(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))",
					time:"(parseFloat(a.laminating.value)>0)?12:0",
					elemClass: "jqselect"
			},
			// opaque:   {name:"Белила", 
			// 	type:"int", 
			// 	units:"краскопрогонов/экз.",
			// 	min:0, 
			// 	max:6, 
			// 	increment:1, 
			// 	value:0,
			// 	presets:[1,2],
			// 	price:"parseFloat(a.opaque.value)* xConst.oneOpaquePrice*(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))",
			// 	time:"(parseFloat(a.opaque.value)>0)?6:0"
			// },
			// opaqueDelta:  {name:"Белила, печать",
			// 	type:"formula",
			// 	price:"parseFloat(a.opaque.value)* xConst.oneOpaquePrice*(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)), 4.3, 1.85 )-1)"
			// },
			rounding:  {name:"Скругление",  
				type:"enum", 
				value:0,
				title:"без кругления",
				options:[
					{title:"без кругления углов", v:"0"},
					{title:"с 4-х сторон", v:"1"}
				],
				price:"xConst.oneRoundingPrice * parseFloat(a.rounding.value)*parseFloat(a.qty.value)",
				time:"(parseFloat(a.rounding.value)>0)?3:0",
				elemClass: "jqselect"
			},
			folds:  {name:"Фальцев", 
					type:"int", 
					units:"на лист",
					min:0, 
					max:5, 
					increment:1, 
					value:0,
					presets:[1,2,3],
					price:"parseFloat(a.folds.value)* xConst.oneFoldPrice * parseFloat(a.qty.value)"
			},
			creasing:  {name:"Бигов", 
					type:"int", 
					units:"на лист",
					min:0, 
					max:5, 
					increment:1, 
					value:0,
					presets:[1,2,3],
					price:"parseFloat(a.creasing.value)* xConst.oneCreasingPrice * parseFloat(a.qty.value)"
			},
			glue:   {name:"Склейка", 
					type:"int", 
					units:"экз.",
					min:0, 
					max:99999, 
					increment:1, 
					value:0,
					price:"parseFloat(a.glue.value)* xConst.oneBindPrice['glue']",
					time:"(parseFloat(a.glue.value)>0)?24:0"
			},
			wireo:   {name:"Пружинка", 
				type:"int", 
				units:"экз.",
				min:0, 
				max:99999, 
				increment:1, 
				value:0,
				price:"parseFloat(a.wireo.value)* xConst.oneBindPrice['wireo']",
				time:"(parseFloat(a.wireo.value)>0)?24:0"
			},
			personalisation:   {name:"Персо­на­ли­зация", 
				type:"int", 
				units:"экз.",
				min:0, 
				max:99999, 
				increment:1, 
				value:0,
				price:"parseFloat(a.personalisation.value)* xConst.onePersonalisationPrice",
				time:"(parseFloat(a.personalisation.value)>0)?6:0"
			},
			bolts: {
                name: "Болты", 
                type: "int", 
                units: "шт.",
                min:0, 
                max:99999, 
                increment:1, 
                value:0,
                price:"parseFloat(a.bolts.value)* xConst.oneBindPrice['bolt']",
                time:"(parseFloat(a.bolts.value)>0)?24:0"
            },
			design:    {name:"Дизайн", 
				type:"int", 
				units:"р.",
				min:0, 
				max:99999, 
				increment:100, 
				value:0,
				presets:[500,1000,2000,3000],
				price:"parseFloat(a.design.value)"
			},
			delivery:{name:"Доставка", 
					type:"enum", 
					value:0,
					title:"без доставки",
					options:[
						{title:"без доставки", v:"0"},
						{title:"Доставка по Архангельску", v:"1"}
					],
					price:"xConst.deliveryArkh * parseFloat(a.delivery.value)",
					elemClass: "form-check"
		   },
		   express:{name:"Исполнение", 
			   type:"enum", 
			   value:'1',
			   title:"в обычном режиме",
			   options:[
				   {title:"в обычном режиме", v:"1"},
				   {title:"Вне очереди (+30% к стоимости)", v:"1.3", desc:"В течение суток."}
			   ],
			   price:"price*(parseFloat(a.express.value)-1)",
			   time:"(parseFloat(a.express.value)>1)?-time+24:0",
			   elemClass: "form-check"
			},
			markup:{name:"Маржа",
				value:"Без скидки",
				type:"formula",
				price:"price*xConst.markup"
			}
		}
	}
}

//	Бумага
var xMedia = {
	np:      {name:"Без бумаги",         price:0.00,     sides:2, size:"430×310мм", group:"Бумага", comments: "Бывают ситуации, когда нужно посчитать только печать, а бумагу Вы приносите свою. Мы не одобряем такие ситуации, но всякое бывает."},
	of80:      {name:"Офсетная бумага, 80г/м²",           price:2.10,     sides:2, size:"440×310мм", group:"Бумага", comments: "Простая офисная бумага, такая же как в Вашем принтере. Только мы на ней печатаем лучше чем Ваш принтер ;)."},
    of100:      {name:"Офсетная бумага, 100г/м²",           price:4.77,     sides:2, size:"440×310мм", group:"Бумага", comments: "Офсетная бумага 100 г/м. Более плотная чем та, что в Вашем принтере, но с такой же фактурой."},
    sc120:      {name:"Матовая меловка, 115г/м²",           price:2.05,     sides:2, size:"440×310мм", group:"Бумага", comments: "Тонкая матовая двусторонняя мелованная бумага. Идеально подходит для большинства печатных работ."},
    <!-- gc120:      {name:"Глянцевая меловка, 120г/м²",         price:1.94,     sides:2, size:"440×310мм", group:"Бумага", comments: ""}, -->
    sc140:      {name:"Матовая меловка, 130г/м²",           price:2.50,     sides:2, size:"440×310мм", group:"Бумага", comments: "Тонкая матовая двусторонняя мелованная бумага. Идеально подходит для большинства печатных работ. Наиболее востребована для печати страниц различных буклетов и книг."},
    <!-- gc140:      {name:"Глянцевая меловка, 140г/м²",         price:1.74,     sides:2, size:"440×310мм", group:"Бумага", comments: ""},  -->
    <!-- sc157:      {name:"Матовая меловка, 160г/м²",          price:2.20,     sides:2, size:"440×310мм", group:"Бумага", comments: ""}, -->
    gc157:      {name:"Глянцевая меловка, 150г/м²",         price:2.50,     sides:2, size:"440×310мм", group:"Бумага", comments: "Глянцевая двусторонняя мелованная бумага. Идеально подходит для большинства печатных работ. Наиболее подходит для печати листовок и плакатов."},
	krft90:      {name:"Крафт-бумага, 90г/м²",         price:3.50,     sides:2, size:"440×310мм", group:"Бумага", comments: "Крафт-бумага, 90 г/м² (пр-во Германия) имеет цвет натурального древесного волокна, отличается экологичностью и имеет прекрасные прочностные характеристики."},
	sc250:      {name:"Матовая меловка, 200г/м²",           price:5.10,     sides:2, size:"440×310мм", group:"Бумага", comments: "Матовая мелованная бумага 200 гм/м. Требуется для печати продукции где необходима более толстая бумага, такие как недорогие приглашения, страницы перекидных календарей."},
    gc250:      {name:"Глянцевая меловка, 200г/м²",         price:5.10,     sides:2, size:"440×310мм", group:"Бумага", comments: "Глянцевая мелованная бумага 200 гм/м. Требуется для печати продукции где необходима более толстая бумага, такие как недорогие приглашения, страницы перекидных календарей."},
    sc300:      {name:"Глянцевая меловка, 300г/м²",         price:6.30,     sides:2, size:"440×310мм", group:"Бумага", comments: "Глянцевая мелованная бумага 300 гм/м. Требуется для печати продукции где необходима более толстая бумага, такие как обложки книг на переплете, приглашения, страницы перекидных календарей."},
    mt300:      {name:"Матовая меловка, 300г/м²",         price:6.30,     sides:2, size:"440×310мм", group:"Бумага", comments: "Матовая мелованная бумага 300 гм/м. Требуется для печати продукции где необходима более толстая бумага, такие как обложки книг на переплете, приглашения, страницы перекидных календарей."},
    w70705:      {name:"Фотобумага, E-Photo 190г/м²",         price:30.00,     sides:2, size:"440×310мм", group:"Бумага", comments: "190 гм/м. Бумага для печати цифровых фотоальбомов реалистичного разрешения. Воспроизведение реальной фотопечати. Небликующая поверхность, устойчива к влажности, стиранию и грязи."},
    w70706:      {name:"Фотобумага, E-Photo 260г/м²",         price:35.00,     sides:2, size:"440×310мм", group:"Бумага", comments: "260 гм/м. Бумага для печати цифровых фотоальбомов реалистичного разрешения. Воспроизведение реальной фотопечати. Небликующая поверхность, устойчива к влажности, стиранию и грязи."},
    w70707:      {name:"Фотобумага, E-Photo Metallic 210г/м²",         price:60.00,     sides:2, size:"440×310мм", group:"Бумага", comments: "210 гм/м. Бумага для печати цифровых фотоальбомов реалистичного разрешения. Воспроизведение реальной фотопечати. Небликующая поверхность, устойчива к влажности, стиранию и грязи."},
	w70708:      {name:"Фотобумага, E-Photo Matt 190г/м²",         price:35.00,     sides:2, size:"440×310мм", group:"Бумага", comments: "190 гм/м. Бумага для печати цифровых фотоальбомов реалистичного разрешения. Воспроизведение реальной фотопечати. Небликующая поверхность, устойчива к влажности, стиранию и грязи."},
    pw225:      {name:"Синтетика PICOFILM 255 г/м3",         price:160.00,     sides:2, size:"430×310мм", group:"Бумага", comments: "Синтетическая полиэстровая плёнка. Устойчива к воде и химическим реагентам и идеальна для продукции, используемой на улице. Устойчива к кратковременному нагреву до 220°С"},
    yb200:   {name:"Синтетика Yapo Blue 158 г/м2",price:70.65,   sides:2, size:"450×320мм", group:"Картон", comments: "Синтетическая бумага. Не рвется, не промокает. Используется для изготовления продукции, требующей высокую износостойкость. * Рекомендуем для печати макетов в светлых тонах."},
    //Двустронний картон
    cbr300:   {name:"Картон, 300г/м²",        price:7.5,     sides:2, size:"464×320мм", group:"Картон", comments: "300 гм/м мелованный картон. Самый распространненный картон для печати бюджетных визиток и открыток."},
	spg300:   {name:"Картон Splendorgel, 300 г/м2",   price:39.7,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозный гладкий дизайнерский картон с шелковистой поверхностью. Extra White (белый). Изготовлен с использованием технологии бесхлорного отбеливания. Подходит для всех видов печати, ламинирования, переплётных работ."},
    <!--  gco310:   {name:"Картон Crystal Board, 300г/м²",          price:4.56,     sides:2, size:"464×320мм", group:"Картон", comments: ""}, -->
    <!--  cbr350:     {name:"Картон Crystal Board, 350г/м²",    price:4.34,     sides:2, size:"464×320мм", group:"Картон", comments: ""}, -->
    c0001580:   {name:"Картон Splendorlux, 250г/м²",   price:35.5,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозный картон с белым высокоглянцевым покрытием лицевой стороны.  Оборот - белый без покрытия. Подходит для печати визиток если нужна повышенная глянцевая сторона."},
    <!-- c0001507:   {name:"Картон Symbol Freelife, 300г/м²",   price:14.9,    sides:2, size:"464×320мм", group:"Картон", comments: ""}, -->
    c0001418:   {name:"Картон Tintoretto Gesso, 250г/м²",   price:37.5,    sides:2, size:"464×320мм", group:"Картон", comments: "Дизайнерский картон. Идеально подходит для любой высококачественной полиграфической продукции от бланков до элитной упаковки."},
    c0001551:   {name:"Картон Nettuno BCO Art, 280г/м²",    price:45.1,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозная дизайнерская бумага с двухсторонней текстурой микровельвет. Цвет - белый."},
    c0001325:   {name:"Constellation Snow Tella, 280г/м²",    price:42.5,    sides:2, size:"464×320мм", group:"Картон", comments: "Картон с тиснением под Лён. Наиболее популярный картон для изготовления представительских визиток."},
    c0001334:   {name:"Картон Aquarello Avorio, 280г/м²",   price:45.78,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозная тонированная в массе бумага без покрытия. Имеет с обеих сторон текстуру микровельвет. Цвет - Avorio (слоновая кость)."},
    <!--c0001335:   {name:"Картон Aquarello Avorio, 160г/м²",   price:12.6,    sides:2, size:"464×320мм", group:"Картон", comments: ""},-->
    c0001319:   {name:"Картон Marina Conciglione, 240г/м²", price:45.50,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозная бумага двухцветной тонировки, имитирующая пергамент."},
    c0001572:   {name:"Картон Sirio Pearl Oyster Shell, 300г/м²", price:75.5,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозный тонированный картон со специальным перламутровым покрытием и односторонним тиснением. Тонирование под цвет жемчуга."},
    <!--   cbr270:   {name:"Картон Crystal Board, 270г/м²",         price:3.28,     sides:2, size:"464×320мм", group:"Картон", comments: ""},  -->
    c0001573:   {name:"Картон Sirio Pearl Polar Down, 300г/м²", price:79.5,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозный тонированный картон со специальным перламутровым покрытием и односторонним тиснением. Белый."},
    c0001570:   {name:"Картон Sirio Pearl Aurium, 300г/м²",   price:87.5,    sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозный тонированный картон со специальным перламутровым покрытием и односторонним тиснением. Тонирование под золото."},
    c0001571:   {name:"Картон Sirio Pearl Platinum, 300г/м²",price:87.5,   sides:2, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозный тонированный картон со специальным перламутровым покрытием и односторонним тиснением. Тонирование под серебро."},
    c10001563:   {name:"Картон Woodstock Betulla, 300г/м²", price:45.5,    sides:2, size:"464×320мм", group:"Картон", comments: "Гладкая дизайнерская бумага с содержанием вторичных волокон древесного цвета. Самые смелые графические решения позволят изготовить из этой бумаги необыкновенную, стильную художественную продукцию"},
	vellum:   {name:"Antique Vellum Солома, 300г/м²", price:59,    sides:2, size:"464×320мм", group:"Картон", comments: "Дизайнерская бумага древесного цвета."},
    <!-- endgold200:   {name:"Бумага ENDURO GOLD 75 г/м²",price:29.25,   sides:2, size:"464×320мм", group:"Картон", comments: ""}, -->
    <!-- c0028824:   {name:"Картон Savile Row Tweed Camel, 300г/м²",price:20.35,   sides:2, size:"450×320мм", group:"Картон", comments: ""}, -->


    //Односторонний картон
    gsk160:   {name:"Калька, 110г/м²",price:45.0,   sides:1, size:"464×320мм", group:"Картон", comments: "Чистоцеллюлозная бумага высокой прозрачности - «калька». Белая."},
    <!-- glama150:   {name:"Калька Glama Digit, 150г/м²",price:25.50,   sides:1, size:"464×320мм", group:"Картон", comments: ""},-->
    <!--   cpa270:   {name:"Картон Crystal Pack, 270г/м²",   price:2.99,    sides:1, size:"464×320мм", group:"Картон", comments: ""}, -->
    <!-- cpa295:   {name:"Картон 1 сторона, 300г/м²",   price:4.76,    sides:1, size:"464×320мм", group:"Картон", comments: ""},-->
    <!-- pt135:      {name:"Синтетика прозр Picofilm 225 г/м3",         price:100.00,     sides:2, size:"430×310мм", group:"Бумага", comments: ""},-->

    //Самоклейка

    adest2:   {name:"Самоклейка Adestor Gloss Perm., 195г/м²",price:19.5,         sides:1, size:"464×320мм", group:"Самоклейка", comments: "Мелованная бумага с самоклеющейся обратной стороной. Для изготовления различных наклеек. "},
    yupotako:   {name:"Yupo Tako синтетика липучая, 170г/м²",price:250,         sides:1, size:"460×320мм", group:"Самоклейка", comments: "Уникальная синтетическая бумага, прилипающая к гладким поверхностям. Полипропиленовая синтетическая бумага c микроприсосками на оборотной стороне. «Клеится без клея» к любым гладким поверхностям без образования пузырей. Может «переклеиваться» неограниченное количество раз, не оставляет следов. Можно мыть и сушить."},
	raf01:   {name:"Самоклейка Raflatac, белая синтетическая, 75г/м²",price:75,         sides:1, size:"460×320мм", group:"Самоклейка", comments: "Синтетический самоклеящийся материал белого цвета"},
	raf02:   {name:"Самоклейка Raflatac, серебристая синтетическая, 80г/м²",price:75,         sides:1, size:"460×320мм", group:"Самоклейка", comments: "Синтетический самоклеящийся материал серебристого цвета"},

    //Тёмный картон
    <!--   c10022460:{name:"Картон Sirio Black, 290г/м²",price:13.87,   sides:2, size:"464×320мм", group:"ТёмныйКартон", comments: ""} -->
}


var xConst = {
        basePrice:      1.6,    
        deliveryArkh:   150,    
        paperMarkup:    0.5,    
        oneCut:         1.8,      
        priceRoundingBase: 1.5,   
        timeRoundingBase:0.7,   
        oneFoldPrice: 0.5,      
        oneSideLaminationPrice:10,
        oneCreasingPrice: 0.8,    
        maxX:437,
        maxY:308,
        oneCalendarAssembly:20,
        oneTearOffQuarter:30,
        oneQuarterCalendCompo:8.6,
        oneWireOPrice:2,
        oneRoundingPrice:0.20,
        oneBindPrice:{
                    glue:30,
                    stitch:7,
                    wireo:20,
					'2bolts': 40,
                    '3bolts': 60
        },
        oneRiegelPrice:10,
        onePersonalisationPrice:1,
        oneOpaquePrice:2.5,
        markup:0.18,
        float1000:function (qty0,highK,lowK) {
			var qty = parseInt(qty0);
			if (highK==lowK || isNaN(qty) || qty<1) return highK;
			var k = 0.70383349 + 2.26120533*(Math.pow(qty/500+1,-16.5383228));//*(highK-lowK) + lowK;
			if (k>highK) k=highK;
			if (k<lowK) k=lowK;
			return k;
		}
};
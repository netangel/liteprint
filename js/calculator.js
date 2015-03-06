var a , o, x = new Object();
x.time = 0; x.price = 0;

var sCurrentUI = 'vis';

function changeUI (key) {
	$('#xCalc').fadeOut('fast', function(){ xSetUI(key); }).fadeIn('fast');
	//	Обновляем кнопочки в меню продуктов
	$("#menu-types LI").removeClass('active');
	$("#menu-types ."+xProducts[key].aClass).parent('LI').addClass('active');
	// TODO: Добавить Scroll до калькулятора/меню
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

	//	Параметры продукта для калькулятора
	for (var key in a) {
		var oRow = a[key];

		//	Enum поле
		if (oRow.type == "enum") {
			//	Заголовок
			$("<p>").addClass('col-label')
					.html( oRow.elemClass == 'form-check' ? '&nbsp;' : oRow.name )
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
						onclick: "xSetOption(" + "'" + key + "','" + oOption.v + "')",
					}).html(oOption.title)
					.addClass(oOption.v == oRow.value ? 'active' : '')
					.appendTo(container);
				}
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
			}
			
			$(container).appendTo('div.col-properties');

		} else if (oRow.type == "int") {
			//	Заголовок
			$("<p>").addClass('col-label')
					.html( oRow.elemClass == 'form-check' ? '&nbsp;' : oRow.name )
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
			$("<a>").attr('href', 'javascript://').click(function() {
				xIncrementOption();
			}).addClass('btn-m')
			  .appendTo(amount_div);
			$("<a>").attr('href', 'javascript://').click(function() {
				xIncrementOption();
			}).addClass('btn-p')
			  .appendTo(amount_div);

			$(amount_div).appendTo(container);

			if (oRow.presets != null) {
				for (var i = 0; i < oRow.presets.length; i++) {
					$("<a>").attr('href', 'javascript://')
							.addClass('amount-change')
							.text(oRow.presets[i])
							.click(function() {
								xSetOption();
							})
							.appendTo(container);
				} 
			}

			$(container).appendTo('div.col-properties');
		}
		
	}

	$("div.col-properties select, div.col-properties input").styler({
		onSelectOpened: function() {  
		$(this).find('.jq-selectbox__trigger-arrow').css('background-position', 'left -20px');},
		onSelectClosed: function() {  
		$(this).find('.jq-selectbox__trigger-arrow').css('background-position', 'left 0px');}
	}); 

	return true;
}

function xSetOption (key, value, renderInterface) {
	console.log("Key: ", key, ", Value: ", value);
	return true;
}

var xProducts = {
	sheet: {
		name:   "Листовая продукция",
		title:  "Листовая продукция", 
		desc:   "a.qty.value+ ' экз. Формат '+a.size.title+', ' + a.color.title + ', ' + xDecap(a.paper.title)+ ( (a.laminating.value!=0)? ((a.laminating.value==1)?'. <b class=\"red\">Односторонняя ламинация</b>':'. <b class=\"red\">Двусторонняя ламинация</b>'):'') + ((a.rounding.value!=0)?'. Кругление '+a.rounding.title:'') + '. Срок исполнения&nbsp;– ' + ((x.time<1.1)?'сутки.':x.time+'&nbsp;р/дн.')  + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
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
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)), 4.3, 1.85 )-1)"
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
					value:100,
					presets:[50,100,200,300,500,1000]
			},
			paper:  {name:"Бумага",
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
			laminating:  {name:"Лами&shy;на&shy;ци&shy;я",  
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
			rounding:  {name:"Кругление углов",  
				type:"enum", 
				value:0,
				title:"без кругления",
				options:[
					{title:"без кругления", v:"0"},
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
				   {title:"по-срочному", v:"1.3",desc:"В течение суток."}
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
		desc:   "a.qty.value+ ' экз. Формат '+a.size.title+', объём '+a.pages.value+'&nbsp;стр. плюс обложки. Переплёт&nbsp;– '+a.bind.title+'.<br/><b>Обложка:</b> ' + a.color.title + ', ' + xDecap(a.paper.title) + ((a.laminating.value!=0)?((a.laminating.value==1)?', <b class=\"red\">односторонняя ламинация</b>':', <b class=\"red\">двусторонняя ламинация</b>'):'')+ '. <br /><b>Страницы: </b> '+ a.color1.title + ', ' + xDecap(a.paper1.title) + '. <br />Срок исполнения&nbsp;– ' + ((x.time<1.1)?'сутки.':x.time+'&nbsp;р/дн.') + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
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
				price:"price*(xConst.float1000(Math.ceil(2*parseFloat(a.qty.value)/parseFloat(a.size.value)) + Math.ceil(parseFloat(a.qty.value)*parseFloat(a.pages.value)/(2*parseFloat(a.size.value))) + Math.ceil(parseFloat(a.paper1.overhead)*parseFloat(a.pages.value)/(2*parseFloat(a.size.value))), 4.3, 1.85 )- 1)"
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
					units:"без&nbsp;обложек",
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
			laminating:  {name:"Лами&shy;на&shy;ция обложки",  
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
			paper:  {name:"Бумага обложки",
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
			paper1: {name:"Бумага страниц",
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
						{title:"пружина", v:"wireo"}
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
						{title:"по Архангельску", v:"1"}
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
				   {title:"по-срочному", v:"1.3",desc:"В течение двух рабочих дней."}
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
		desc:   "'Тираж ' + a.qty.value+ ' экз. Формат раскрытого '+a.size.title+', печать ' + a.color.title + ', материал&nbsp;– ' + xDecap(a.paper.title) + '. Срок исполнения&nbsp;– ' + ((x.time<1.1)?'сутки.':x.time+'&nbsp;р/дн.') + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
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
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/parseFloat(a.size.value)), 4.3, 1.85 )-1)"
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
						{title:"42×14&nbsp;см", v:"2.0000000001", desc:"Свёрнутый 14×14 см"} //такой фокус с дробным числом надо делать, когда точное значение уже есть
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
			paper:  {name:"Бумага",
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
						{title:"по Архангельску", v:"1"}
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
				   {title:"по-срочному", v:"1.3",desc:"В течение суток."}
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
		desc:   "a.qty.value+ ' экз., ' + a.color.title + ', ' + xDecap(a.paper.title) +( (a.laminating.value!=0)? ((a.laminating.value==1)?'. <b class=\"red\">Односторонняя ламинация</b>':'. <b class=\"red\">Двусторонняя ламинация</b>'):'') + ((a.rounding.value!=0)?'. Кругление '+a.rounding.title:'') + '. Срок исполнения&nbsp;– ' + ((x.time<0.51)?'в тот же день.':x.time+'&nbsp;р/дн.') + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
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
			laminating:  {name:"Лами&shy;на&shy;ци&shy;я",  
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
			rounding:  {name:"Кругление углов",  
				type:"enum", 
				value:0,
				title:"без кругления",
				options:[
					{title:"без кругления", v:"0"},
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
						{title:"по Архангельску", v:"1"}
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
				   {title:"по-срочному", v:"1.3",desc:"В тот же день."}
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
		desc:   "a.qty.value+ ' экз. Средние блоки '+a.size.title+', печать ' + a.color.value + ', ' + xDecap(a.paper.title)+ ( (a.laminating.value!=0)? ((a.laminating.value==1)?'. <b class=\"red\">Односторонняя ламинация</b>':'. <b class=\"red\">Двусторонняя ламинация</b>'):'') + '. Срок исполнения&nbsp;– ' + ((x.time<1.1)?'сутки.':x.time+'&nbsp;р/дн.')  + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
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
			laminating:  {name:"Лами&shy;на&shy;ци&shy;я",  
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
						{title:"по Архангельску", v:"1"}
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
				   {title:"по-срочному", v:"1.3",desc:"В течение двух дней."}
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
		title:  "Продукция на&nbsp;пружине", 
		desc:   "a.qty.value+ ' экз. Формат '+a.size.title+', объём '+a.pages.value+'&nbsp;листов плюс обложки. Пружинный переплёт.'+((a.riegel.value!=0)?' Ригель.':'')+'<br/><b>Обложки:</b> ' + a.color.title + ', ' + xDecap(a.paper.title) + ((a.laminating.value!=0)?((a.laminating.value==1)?', <b class=\"red\">односторонняя ламинация</b>':', <b class=\"red\">двусторонняя ламинация</b>'):'')+ '. <br /><b>Листы: </b> '+ a.color1.title + ', ' + xDecap(a.paper1.title) + ((a.laminating1.value!=0)?((a.laminating1.value==1)?', <b class=\"red\">односторонняя ламинация</b>':', <b class=\"red\">двусторонняя ламинация</b>'):'')+ '. <br />Срок исполнения&nbsp;– ' + ((x.time<1.1)?'сутки.':x.time+'&nbsp;р/дн.') + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
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
				price:"price*(xConst.float1000( Math.ceil((parseFloat(a.qty.value)*parseFloat(a.pages.value))/parseFloat(a.size.value)), 4.3, 1.85 )-1)"
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
					units:"без&nbsp;обложек",
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
			laminating:  {name:"Лами&shy;на&shy;ция обложек",  
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
			paper:  {name:"Бумага обложек",
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
			laminating1:  {name:"Лами&shy;на&shy;ция листов",  
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
			paper1: {name:"Бумага листов",
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
						{title:"по Архангельску", v:"1"}
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
				   {title:"по-срочному", v:"1.3",desc:"В течение двух рабочих дней."}
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
		desc:   "a.qty.value+ ' экз. Формат ' + a.sizeX.value + '×' + a.sizeY.value + '&nbsp;мм (' + xPerSheet(a.bleed.value) + ' на листе), печать ' + a.color.title + ', ' + xDecap(a.paper.title) + '. '+((a.folds.value=='0')?'':'Сгибы&nbsp;– '+a.folds.value+' на экз. ')+((a.creasing.value=='0')?'':'Биговка&nbsp;– '+a.creasing.value+' на экз. ')+ ((a.glue.value=='0')?'':'Склейка&nbsp;– '+a.glue.value+'&nbsp;экз. ') + ((a.wireo.value=='0')?'':'Переплёт на пружину&nbsp;– '+a.wireo.value+'&nbsp;экз. ') + ((a.laminating.value!=0)?((a.laminating.value==1)?' <b class=\"red\">Односторонняя ламинация.</b>':' <b class=\"red\">Двусторонняя ламинация.</b>'):'')+((a.rounding.value!=0)?' Кругление '+a.rounding.title+'.':'')+'<br />Срок исполнения&nbsp;– ' + ((x.time<1.1)?'сутки.':x.time+'&nbsp;р/дн.') + ((a.delivery.value!=0)?' Доставка '+a.delivery.title+'.':'')",      //Формула, формирующая описание
		picUrl: "http://liteprint.me/i/calc/general.gif",             //URL картинки
		aClass: "type-universal",
		err:    "'Допустимые тиражи от '+a.qty.min+' до '+a.qty.max+' '+a.qty.units+' Максимальный размер '+a.sizeX.max+'×'+a.sizeY.max+'&nbsp;мм, минимальный –&nbsp;'+a.sizeX.min+'×'+a.sizeY.min+'&nbsp;мм.'",
		ui:{                    //поля интерфейса и расчётов
			print:  {name:"Индиго",
					type:"formula",
					price:"xConst.basePrice * eval(a.color.value) * (parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))",
					time:"48"
			},
			printDelta:  {name:"Печать",
				type:"formula",
				price:"price*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)), 4.3, 1.85 )-1)"
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
			laminating:  {name:"Лами&shy;на&shy;ция",  
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
			opaque:   {name:"Белила", 
				type:"int", 
				units:"краскопрогонов/экз.",
				min:0, 
				max:6, 
				increment:1, 
				value:0,
				presets:[1,2],
				price:"parseFloat(a.opaque.value)* xConst.oneOpaquePrice*(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))",
				time:"(parseFloat(a.opaque.value)>0)?6:0"
			},
			opaqueDelta:  {name:"Белила, печать",
				type:"formula",
				price:"parseFloat(a.opaque.value)* xConst.oneOpaquePrice*(parseFloat(a.paper.overhead)+Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)))*(xConst.float1000( Math.ceil(parseFloat(a.qty.value)/xPerSheet(a.bleed.value)), 4.3, 1.85 )-1)"
			},
			rounding:  {name:"Кругление углов",  
				type:"enum", 
				value:0,
				title:"без кругления",
				options:[
					{title:"без кругления", v:"0"},
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
			personalisation:   {name:"Персо&shy;на&shy;ли&shy;зация", 
				type:"int", 
				units:"экз.",
				min:0, 
				max:99999, 
				increment:1, 
				value:0,
				price:"parseFloat(a.personalisation.value)* xConst.onePersonalisationPrice",
				time:"(parseFloat(a.personalisation.value)>0)?6:0"
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
						{title:"по Архангельску", v:"1"}
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
				   {title:"по-срочному", v:"1.3",desc:"В течение суток."}
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
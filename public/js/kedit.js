//網頁編輯器
var _kedit_id = 0;

Vue.component('kedit', {
	template: `
		<div :id="'summernote' + id"></div>
	`,
	data: function() { return {
		id: ++_kedit_id,
	}},
	props: ['value', 'placeholder'],
	mounted: function () {
		var me = this;
		$('#summernote' + this.id).html(this.value).summernote({
			height: 300,                 // set editor height
			minHeight: null,             // set minimum height of editor
			maxHeight: null,             // set maximum height of editor
			focus: true,                 // set focus to editable area after initializing summernote
			//airMode: true,
			placeholder: this.placeholder,
			toolbar: [
				//['style', ['style']],
				['font', ['bold', 'italic', 'underline', 'clear']],
				//['fontname', ['fontname']],
				['color', ['color']],
				//['para', ['ul', 'ol', 'paragraph']],
				//['height', ['height']],
				['table', ['table']],
				['insert', ['media', 'link', 'hr', 'picture', 'video']],
				['view', ['fullscreen', 'codeview']],
				//['help', ['help']]
			],
		}).on("summernote.change", function(e) {
			var html = $(this).summernote('code');
			me.$emit('update:value', html);
		});
	},
});

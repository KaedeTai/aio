//文字輸入元件測試
Vue.component('kinput', {
	template: `<input v-model="val"></input>`,
	props: ['value'],
	data: function() { return {
		val: this.value,
	}},
	watch: {
		val: function () {
			this.$emit('update:value', this.val);
		},
	},
});

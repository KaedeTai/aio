//可搜尋下拉式選單
Vue.component('kselect', {
	template: `
		<div class="ui search dropdown selection" :class="{active: visible, visible: visible}">
			<i v-if="value && !visible" @click="clear" class="icon delete"></i>
			<i v-else @click="visible = !visible" class="icon dropdown"></i>
			<input @keydown="search" v-model="input" class="search" autocomplete="off" placeholder="請選擇" >
			<div class="text filtered"></div>
			<div class="menu transition" :class="{hidden: !visible}" tabindex="-1" style="display: block !important;">
				<div v-if="filtered.length == 0" class="item">找不到</div>
				<div @click="select(d)" class="item" v-for="d in filtered" v-text="d.label"></div>
			</div>
		</div>
	`,
	data: function() { return {
		visible: false,
		input: '',
		value: '',
	}},
	props: ['selected', 'datalist'],
	mounted: function () {
		var datalist = this.datalist;
		for (var i in datalist) {
			var d = datalist[i];
			if (d.value != this.selected) continue;
			this.value = this.selected;
			return this.select(d);
		}
	},
	computed: {
		filtered: function() {
			var datalist = this.datalist;
			if (this.value) return [];
			if (!this.input) return datalist.slice(0, 100);
			var filtered = [];
			for (var i in datalist) {
				var d = datalist[i];
				if (d.label.indexOf(this.input) == -1 && d.value.indexOf(this.input) == -1) continue;
				filtered.push(d);
				if (filtered.length == 100) break;
			}
			return filtered;
		},
	},
	methods: {
		clear: function(e) {
			this.visible = true;
			this.value = this.input = '';
			this.$emit('update:selected', '');
		},
		search: function(e) {
			if (e.key == 'Enter') {
				var datalist = this.datalist;
				for (var i in datalist) {
					var d = datalist[i];
					if (d.label.indexOf(this.input) == -1 && d.value.indexOf(this.input) == -1) continue;
					return this.select(d);
				}
			}
			this.visible = true;
			this.value = '';
			this.$emit('update:selected', '');
		},
		select: function(data) {
			this.visible = false;
			this.value = data.value;
			this.input = data.label;
			this.$emit('update:selected', this.value);
		},
	},
});

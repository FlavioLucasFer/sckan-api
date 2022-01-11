
export default function uuid(length = 36) {
	var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	
	return [...Array(length)].reduce(a => a + p[~~(Math.random() * p.length)], '');
};

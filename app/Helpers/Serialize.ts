import { DateTime } from "luxon";
import moment from "moment";

export default class Serialize {
	public static formatTimestamp(value: DateTime | null) {
		if (!value)
			return;
		
		if (typeof value === 'string')
			value = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss');

		try {
			return value.toFormat('dd/MM/yyyy HH:mm:ss');
		} catch {
			return moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');	
		}
	}
}

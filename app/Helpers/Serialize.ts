import { DateTime } from "luxon";

export default class Serialize {
	public static formatTimestamp(value: DateTime | null) {
		return value ? value.toFormat('dd/MM/yyyy HH:mm:ss') : value;
	}
}

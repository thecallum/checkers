const setupQueue = () => {
	let queue = [];
	const subscribeList = [];

	const add = id => {
		queue.push(id);
		emit();
	};

	const getPlayers = () => {
		const spliced = queue.splice(0, 2);
		emit();
		return spliced;
	};

	const remove = id => {
		queue = queue.filter(userID => userID !== id);
		emit();
	};

	const subscribe = cb => subscribeList.push(cb);

	const emit = () => subscribeList.map(cb => cb(queue));

	return { add, getPlayers, subscribe, remove };
};

module.exports = setupQueue;

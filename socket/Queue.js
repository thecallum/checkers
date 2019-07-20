module.exports = () => {
    let queue = [];
    const subscribeList = [];

    const add = id => {
        const inQueue = queue.includes(id);
        if (inQueue) return false;
        queue.push(id);
        emit();
        return true;
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

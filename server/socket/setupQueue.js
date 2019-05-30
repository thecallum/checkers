const setupQueue = () => {
    let queue = [];
    const subscribeList = [];

    const get = () => queue;

    const add = id => {
        queue.push(id);
        emit();
    };

    const getPlayers = () => {
        const spliced =  queue.splice(0,2);
        emit();
        return spliced;
    }

    const remove = id => {
        queue = queue.filter(userID => userID !== id);
        emit();
    }

    const subscribe = cb => subscribeList.push(cb);

    const emit = () => subscribeList.map(cb => cb(queue));

    return { queue, add, getPlayers, subscribe, remove, get };    
}

module.exports = setupQueue;
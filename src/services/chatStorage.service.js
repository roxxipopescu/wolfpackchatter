export const saveMessage = (name, obj) => {
    localStorage.setItem(name, JSON.stringify(obj));
};

export const fetchAllMessages = name => {
    return localStorage.getItem(name); 
};

export default { saveMessage, fetchAllMessages };
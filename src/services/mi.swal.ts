import Swal from 'sweetalert2'

export const paramsSwalAlert = {
    icon: '',
    title: '',
    content: '',    
    html: '',
    text: '',
    showCancelButton: false,
    showConfirmButton: true,
    confirmButtonText: 'Listo',
    cancelButtonText: 'Cancelar'
}

const backgroundAlertSwal = {
    background: '#212121',
    color: 'white'
};

const backgroundAlertSwalBorderless = {
    background: 'rgba(54, 70, 93, 0.99)',
    color: 'white'
};

const colorBtnAlertSwal = {
    confirmButtonColor: '#4285F4'
}



export const ToastAlertSwal = Swal.mixin({
    position: 'bottom-end',
    toast: true,
    showConfirmButton: false,
    timer: 1500,
    background: backgroundAlertSwal.background,
    color: backgroundAlertSwal.color,
    showClass: {
        popup: 'animate__animated animate__bounceIn'
    }
    // hideClass: {
    //   popup: 'animate__animated animate__bounceOut'
    // }    
});

const themeOneAlertSwal = Swal.mixin({
    confirmButtonColor: colorBtnAlertSwal.confirmButtonColor,
    background: backgroundAlertSwalBorderless.background,
    color: backgroundAlertSwalBorderless.color,
});

const themeDefaultAlertSwal = Swal.mixin({
    confirmButtonColor: colorBtnAlertSwal.confirmButtonColor,
});

export const showToastSwal = (icon, title, timer = 1500) => {
    ToastAlertSwal.fire({
        icon: icon,
        title: title,
        timer: timer
    })
}

export const showAlertSwalOk = (icon, title, text, btnOkText = 'Ok', theme = 1) => {
    const _themeShowSwalAlert = returnThemeSwalAlert(theme);
    _themeShowSwalAlert.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: btnOkText,
    })
}

// theme 0 = defaul 1 0 
export const showAlertSwalHtml = (values, theme = 1) => {
    const _themeShowSwalAlert = returnThemeSwalAlert(theme);
    _themeShowSwalAlert.fire(values)
}

export const showAlertSwalDecision = async (values, theme = 1) => {
    const _themeShowSwalAlert = returnThemeSwalAlert(theme);
    return await _themeShowSwalAlert.fire(values).then((result) => {
        return result;
    })
}

export const showAlertSwalHtmlDecision = async (values, theme = 1) => {    
    const _swalAlertValues = paramsSwalAlert;
    _swalAlertValues.title = `<p class="text-base">${values.title}</p>`;
    _swalAlertValues.html = `<div class="text-base" style="display: inline-flex;">                    
                                    <p>${values.content}</p>
                                </div>`;
    _swalAlertValues.confirmButtonText = values.confirmButtonText || 'Si, borrar';
    _swalAlertValues.showCancelButton = true;
    
    const _themeShowSwalAlert = returnThemeSwalAlert(theme);
    return await _themeShowSwalAlert.fire(values).then((result) => {
        return result;
    })
}

function returnThemeSwalAlert(op) {
    switch (op) {
        case 0:
            return themeDefaultAlertSwal;
            break;
        case 1:
            return themeOneAlertSwal;
            break;
    }
}
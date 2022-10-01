// Hàm `Validitor`

function Validator(options){
    // Tìm cha của element
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }else{
                element = element.parentElement
            }
        }
    }
    
    var selectorRules = {}
    //Hàm thực hiện validate
    function validate(inputElement,rule){
        var errorMessage
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector]
        //Lấy qua từng rule & kiểm tra
        //Nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0 ; i< rules.length ; ++i){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)

            }
            
            if(errorMessage) break;
        }
        if(errorMessage){
            errorElement.innerText = errorMessage
            getParent(inputElement,options.formGroupSelector).classList.add('invalid')

        }else{
            errorElement.innerText =''
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
            }
        //Trả về phủ định của có lỗi(ko có lỗi)
        return !errorMessage
    }

    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form)

    if(formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true
            //Lặp qua từng rules và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)

                var isValid = validate(inputElement,rule)
                if(!isValid){
                    isFormValid = false
                }
            })
            if(isFormValid){
                //Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        // values[input.name] = input.value
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+ input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(input.matches(':checked')){
                                    values[input.name] = []
                                    return values
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)

                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
                //Trường hợp với hành vi mặc định html
                else{
                    formElement.Submit();
                }
            } }
        }
        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ..)
        options.rules.forEach(function(rule) {
            
            //Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            //NHận về 1 nodeList sau đó convert qua array để sử dụng hàm array
            Array.from(inputElements).forEach(function(inputElement){
                // Xử lí trường hợp blur ra ngoài
                inputElement.onblur = function(){  
                    validate(inputElement,rule)
                }
                // Xử lí khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText =''
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }
            })
        });
}
    


//Định nghĩa rules
//Nguyên tắc của các rules:
//1. Khi có lỗi => Trả ra messae lỗi
//2. Khi hợp lệ => Không trả ra gì   
Validator.isRequired =  function(selector, message){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : message ||'Vui lòng nhập trường này'
            //value.trim(): Loại bỏ khoảng cách đầu dòng
        }
    }
}

Validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
            
        }
    }
}

Validator.minLength =  function(selector,min){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
            
        }
    }
}
Validator.isConfirm =  function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message|| 'Gía trị nhập vào không chính xác'
            
        }
    }
}
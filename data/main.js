config_static_cont = document.getElementById("config_static_cont")
config_dynamic_cont = document.getElementById("config_dynamic_cont")
config_custom_cont = document.getElementById("config_custom_cont")
config_settings_cont = document.getElementById("config_settings_cont")

config_spacer = document.getElementById("config_spacer")

config_static = document.getElementById("config_static")
config_dynamic = document.getElementById("config_dynamic")
config_custom = document.getElementById("config_custom")
config_settings = document.getElementById("config_settings")

config_static_settings = document.getElementById("static_settings_container")
config_custom_settings = document.getElementById("custom_settings_container")


config_static.addEventListener('click', () => {
    console.log("Static Config!")

    config_static_settings.style.display = 'block'
    config_custom_settings.style.display = 'none'

    config_static_cont.className = 'mt-1 h-10 border-l border-slate-700'
    config_dynamic_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tl-md border-l border-t border-slate-600'
    config_custom_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_settings_cont.className = 'h-10 mt-1 bg-slate-700 border-t border-slate-600'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 border border-slate-600 mt-1'

    config_static.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
});

config_dynamic.addEventListener('click', () => {
    console.log("Dynamic Config!")

    config_static_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tr-md border-x border-t border-slate-600'
    config_dynamic_cont.className = 'mt-1 h-10'
    config_custom_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tl-md border-l border-t border-slate-600'
    config_settings_cont.className = 'h-10 mt-1 bg-slate-700 border-t border-slate-600'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 border border-slate-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_dynamic.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
});

config_custom.addEventListener('click', () => {
    console.log("Custom Config!")

    config_static_settings.style.display = 'none'
    config_custom_settings.style.display = 'block'

    config_static_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_dynamic_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tr-md border-x border-t border-slate-600'
    config_custom_cont.className = 'mt-1 h-10'
    config_settings_cont.className = 'h-10 mt-1 bg-slate-700 border-t border-slate-600'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 rounded-tl-md border border-slate-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_custom.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
});

config_settings.addEventListener('click', () => {
    console.log("Custom Config!")

    config_static_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_dynamic_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_custom_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_settings_cont.className = 'mt-1 h-10'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 rounded-tr-md border border-slate-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_settings.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
});
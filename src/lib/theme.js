export const normalizeTheme=value=>value==='light'||value==='dark'?value:'system';
export const resolveTheme=(preference,systemDark)=>preference==='system'?(systemDark?'dark':'light'):preference;

export function createThemeController(onChange=()=>{}){
  const scheme=matchMedia('(prefers-color-scheme: dark)');
  let preference='system';
  try{preference=normalizeTheme(localStorage.getItem('kenny-space-theme'));}catch{}
  const apply=()=>{
    document.documentElement.dataset.themeMode=preference;
    document.documentElement.dataset.theme=resolveTheme(preference,scheme.matches);
    onChange(preference);
  };
  const onSystemChange=()=>{if(preference==='system')apply();};
  scheme.addEventListener('change',onSystemChange);
  apply();
  return {
    set(value){preference=normalizeTheme(value);try{localStorage.setItem('kenny-space-theme',preference);}catch{}apply();},
    destroy(){scheme.removeEventListener('change',onSystemChange);}
  };
}

export function bindThemeControls(){
  const buttons=[...document.querySelectorAll('[data-theme-mode]')].filter(node=>node.tagName==='BUTTON');
  const controller=createThemeController(preference=>{
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.themeMode===preference));
  });
  for(const button of buttons)button.addEventListener('click',()=>controller.set(button.dataset.themeMode));
  return controller;
}

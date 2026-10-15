import React from 'react';
import images from '../../data/images.generated.json';

export const Media=React.forwardRef(function Media({src,loading='lazy',sizes,...props},ref){
  const image=images[src];
  return <img {...props} ref={ref} src={image?.src||src} srcSet={image?.srcset||undefined}
    sizes={sizes||(image?.srcset?(src.match(/\/(online|taste|ai|execution|ai-perch)\.webp$/)?'(max-width: 600px) 40vw, (max-width: 1100px) 25vw, 278px':'(max-width: 700px) 85vw, (max-width: 1100px) 48vw, 800px'):undefined)}
    width={props.width||image?.width} height={props.height||image?.height}
    loading={src?.match(/\/(online|taste|ai|execution)\.webp$/)?'eager':loading} decoding="async"/>;
});

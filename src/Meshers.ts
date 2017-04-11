export function stupid(volume:number[], dims:[number, number, number]){
    let vertices:number[][];
    let faces:number[][];
    
    let x:number[]  =   [0,0,0];
    let n:number    =   0;

    for(x[2]=0; x[2]<dims[2]; ++x[2]){

        for(x[1]=0; x[1]<dims[1]; ++x[1]){

            for(x[0]=0; x[0]<dims[0]; ++x[0], ++n){

                if(!!volume[n]) {

                    for(let d=0; d<3; ++d) {

                        let t:number[] = [x[0], x[1], x[2]];
                        let u:number[] = [0,0,0]; 
                        let v:number[] = [0,0,0];

                        u[(d+1)%3] = 1;
                        v[(d+2)%3] = 1;

                        for(var s=0; s<2; ++s) {

                            let tmp:number[] = u;
                            let vertex_count:number = vertices.length;

                            t[d] = x[d] + s;
                            u = v;
                            v = tmp;

                            vertices.push([t[0],           t[1],           t[2]          ]);
                            vertices.push([t[0]+u[0],      t[1]+u[1],      t[2]+u[2]     ]);
                            vertices.push([t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2]]);
                            vertices.push([t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]]);

                            faces.push([vertex_count, vertex_count+1, vertex_count+2, vertex_count+3, volume[n]]);
                        }
                    }
                } 
            }
        }
    }

    return { vertices:vertices, faces:faces };
}
export const user = `{
    user{
    id
    login
    }
    }`
export const userInfo = `{
    user{
    attrs
    }
    }`
export const projetUser = `{
    user{
    finished_projects
    }
    }`
export const xp = `
 {
  transaction_aggregate(where:{type:{_eq:"xp"},eventId:{_eq:41}}
  ) {
  aggregate{
    sum{
      amount
    }
  }
  } 
}
`
export const level = `
  {
   transaction(
    where: { type: { _eq: "level" }, eventId: { _eq: 41 } }
    order_by: { id: desc }
    limit: 1
   ) {
    amount
  }
 }
 `
export const projectsQuery = `
 {
  user {
          transactions(
            where: {type: {_eq: "xp"}, object: {type:  {_eq: "project"}},path:{_nlike:"%checkpoint%"}}
              order_by: {createdAt: desc}
          ) {
          object {
            name
          }
          amount
          createdAt
        }
      }
}
`;
export const failedAudits = `
{
  user{
    audits_aggregate(where: {closureType:{_eq: failed}}){
      aggregate{
        count
      }
   }
  }
}`
export const succeededAudits= `
{
  user{
    audits_aggregate(where : {closureType:{_eq : succeeded}}){
      aggregate{
        count      
      }
    }
  }
}
`